#include <linux/init.h>
#include <linux/fs.h>
#include <linux/slab.h>
#include <linux/module.h>
#include <linux/device.h>
#include <linux/semaphore.h>
#include <linux/cdev.h>
#include <linux/interrupt.h>
#include <linux/gpio.h>
#include <linux/irq.h>
#include <asm/atomic.h>

MODULE_AUTHOR("Tom Mullins");
MODULE_LICENSE("GPL");

#define BUF_LEN 1024

/* TODO set these */
const int adc_pins[] = {1, 2, 3, 4, 5, 6, 7, 8};
const int adc_int_pin = 9;

struct class *adc_class = NULL;
dev_t first_dev;

struct adc_t
{
    char *buf;
    int buf_start, buf_end;
    struct cdev cdev;
    struct semaphore sem;
    struct device *device;
    int irq;
    atomic_t value;
    dev_t dev;
}
adcs[1];

static int adc_open(struct inode *inode, struct file *file);
static ssize_t adc_read(struct file *file, char __user *udata, size_t count,
        loff_t *offset);

static void adc_free(struct adc_t *adc);
static int adc_init(dev_t dev, struct adc_t *adc);

struct file_operations fops =
{
    /* TODO ability to flush somehow? */
    /* TODO ability to select */
    .owner = THIS_MODULE,
    .open = adc_open,
    .read = adc_read
};

static int adc_open(struct inode *inode, struct file *file)
{
    int i = iminor(inode);
    if (i != 0)
        return -ENXIO;
    file->private_data = &adcs[i];
    return 0;
}

static ssize_t adc_read(struct file *file, char __user *udata, size_t count,
        loff_t *offset)
{
    int len, unwritten;
    struct adc_t *adc = file->private_data;

    if (down_interruptible(&adc->sem))
        return -ERESTARTSYS;

    /* TODO local_irq_save */

    if (adc->buf_start == adc->buf_end)
    {
        /* Buffer is empty */
        len = 0;
    }
    else if (adc->buf_start < adc->buf_end)
    {
        len = adc->buf_end - adc->buf_start;
        if (len > count)
        {
            len = count;
        }
        len -= copy_to_user(udata, adc->buf + adc->buf_start, len);
        adc->buf_start += len;
    }
    else
    {
        len = BUF_LEN + adc->buf_end - adc->buf_start;
        if (len > count)
        {
            len = count;
        }
        unwritten = copy_to_user(udata, adc->buf + adc->buf_start,
                BUF_LEN - adc->buf_start);
        if (unwritten == 0)
        {
            /* Copy succeeded, copy the rest */
            unwritten = copy_to_user(udata, adc->buf, adc->buf_end);
            len -= unwritten;
            adc->buf_start = adc->buf_end - unwritten;
        }
        else
        {
            /* Copy failed, stop now */
            len = BUF_LEN - adc->buf_start - unwritten;
            adc->buf_start = 0;
        }
    }

    /* TODO local_irq_restore */

    up(&adc->sem);
    return len;
}

irqreturn_t adc_irq(int irq, void *adc_vp)
{
    struct adc_t *adc = adc_vp;

    (void)adc; /* TODO read pins */

    return IRQ_HANDLED;
}

static int adc_init(dev_t dev, struct adc_t *adc)
{
    int err, i;

    /* Initialize members */
    cdev_init(&adc->cdev, &fops);
    adc->dev = dev;
    sema_init(&adc->sem, 1);

    /* Make cdev file operations accessible */
    err = cdev_add(&adc->cdev, adc->dev, 1);
    if (err)
    {
        printk(KERN_ALERT "Error %d adding cdev\n", -err);
        goto err_cdev;
    }

    /* Set GPIO direction */
    for (i = 0; i < 8; i++)
    {
        /* TODO maybe we should use gpio_request */
        err = gpio_direction_input(adc_pins[i]);
        if (err < 0) {
            printk(KERN_ALERT "Error %d setting gpio %d to input\n", -err,
                    adc_pins[i]);
            goto err_gpio;
        }
    }

    /* Also set direction for interrupt (TODO is this necessary?) */
    err = gpio_direction_input(adc_int_pin);
    if (err < 0) {
        printk(KERN_ALERT "Error %d setting gpio %d to input\n", -err,
                adc_int_pin);
        goto err_gpio;
    }

    /* Request the IRQ */
    adc->irq = gpio_to_irq(adc_int_pin);
    if (adc->irq < 0) {
        err = adc->irq;
        printk(KERN_ALERT "Error %d requesting irq number for gpio %d\n", -err,
                adc_pins[i]);
        goto err_gpio_to_irq;
    }

    err = request_irq(adc->irq, adc_irq, IRQF_DISABLED, "adc", adc);
    if (err < 0) {
        printk(KERN_ALERT "Error %d requesting irq %d\n", -err, adc->irq);
        goto err_req_irq;
    }

    err = irq_set_irq_type(adc->irq, IRQ_TYPE_EDGE_RISING);
    if (err < 0) {
        printk(KERN_ALERT "Error %d setting irq %d type rising edge\n", -err,
                adc->irq);
        goto err_irq_type;
    }

    /* Create the file in /dev */
    adc->device = device_create(adc_class, NULL, adc->dev, NULL, "adc%d",
            MINOR(adc->dev));
    if (IS_ERR(adc->device))
    {
        err = PTR_ERR(adc->device);
        goto err_device;
    }

    /* Allocate data buffer for readings */
    adc->buf = kmalloc(BUF_LEN, GFP_KERNEL);
    if (!adc->buf)
    {
        err = -ENOMEM;
        goto err_buf;
    }

    return 0;

err_buf:
err_device:
err_irq_type:
    free_irq(adc->irq, adc);
err_req_irq:
err_gpio_to_irq:
err_gpio:
    cdev_del(&adc->cdev);
err_cdev:
    return err;

}

static void adc_free(struct adc_t *adc) {
    kfree(adc->buf);
    device_destroy(adc_class, adc->dev);
    free_irq(adc->irq, adc);
    cdev_del(&adc->cdev);
}

static int __init adc_init_module(void)
{
    int err;

    /* Allocate character devices and get major number */
    err = alloc_chrdev_region(&first_dev, 0, 1, "adc");
    if (err)
    {
        printk(KERN_ALERT "Error %d allocating chrdev region\n", -err);
        goto err_chrdev;
    }

    /* Register our device class for a file in /dev */
    adc_class = class_create(THIS_MODULE, "adc");
    if (IS_ERR(adc_class))
    {
        err = PTR_ERR(adc_class);
        printk(KERN_ALERT "Error %d creating device class\n", -err);
        goto err_class;
    }

    /* Initialize adc struct */
    err = adc_init(first_dev, &adcs[0]);
    if (err)
    {
        goto err_adc;
    }

    return 0;

err_adc:
    class_destroy(adc_class);
err_class:
    unregister_chrdev_region(first_dev, 1);
err_chrdev:
    return err;
}

static void adc_exit_module(void)
{
    adc_free(&adcs[0]);
    class_destroy(adc_class);
    unregister_chrdev_region(first_dev, 1);
}

module_init(adc_init_module);
module_exit(adc_exit_module);
