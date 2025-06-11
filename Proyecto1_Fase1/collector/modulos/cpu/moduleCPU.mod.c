#include <linux/module.h>
#define INCLUDE_VERMAGIC
#include <linux/build-salt.h>
#include <linux/elfnote-lto.h>
#include <linux/export-internal.h>
#include <linux/vermagic.h>
#include <linux/compiler.h>

#ifdef CONFIG_UNWINDER_ORC
#include <asm/orc_header.h>
ORC_HEADER;
#endif

BUILD_SALT;
BUILD_LTO_INFO;

MODULE_INFO(vermagic, VERMAGIC_STRING);
MODULE_INFO(name, KBUILD_MODNAME);

__visible struct module __this_module
__section(".gnu.linkonce.this_module") = {
	.name = KBUILD_MODNAME,
	.init = init_module,
#ifdef CONFIG_MODULE_UNLOAD
	.exit = cleanup_module,
#endif
	.arch = MODULE_ARCH_INIT,
};

#ifdef CONFIG_MITIGATION_RETPOLINE
MODULE_INFO(retpoline, "Y");
#endif



static const char ____versions[]
__used __section("__versions") =
	"\x18\x00\x00\x00\xa5\x7a\x01\x10"
	"kernel_cpustat\0\0"
	"\x14\x00\x00\x00\xd5\xe3\x7d\x01"
	"nr_cpu_ids\0\0"
	"\x1c\x00\x00\x00\x53\x54\x9a\xb1"
	"__per_cpu_offset\0\0\0\0"
	"\x1c\x00\x00\x00\x75\x3f\x68\x9e"
	"__cpu_possible_mask\0"
	"\x18\x00\x00\x00\xd9\xe8\xa1\x53"
	"_find_next_bit\0\0"
	"\x28\x00\x00\x00\xb3\x1c\xa2\x87"
	"__ubsan_handle_out_of_bounds\0\0\0\0"
	"\x14\x00\x00\x00\x85\xf8\xb3\x22"
	"proc_create\0"
	"\x10\x00\x00\x00\x74\x8c\xe9\xf1"
	"avenrun\0"
	"\x18\x00\x00\x00\x48\xc7\xb3\x0f"
	"cpufreq_cpu_get\0"
	"\x18\x00\x00\x00\xf4\x85\xf8\xa7"
	"cpufreq_cpu_put\0"
	"\x18\x00\x00\x00\x14\x27\x52\x8d"
	"__rcu_read_lock\0"
	"\x14\x00\x00\x00\x6e\xc5\x70\x35"
	"init_task\0\0\0"
	"\x1c\x00\x00\x00\x0f\x81\x69\x24"
	"__rcu_read_unlock\0\0\0"
	"\x14\x00\x00\x00\xcb\xc0\x25\x23"
	"seq_printf\0\0"
	"\x14\x00\x00\x00\xb8\x4d\xa6\xfc"
	"seq_read\0\0\0\0"
	"\x14\x00\x00\x00\xa2\xe6\x82\x14"
	"seq_lseek\0\0\0"
	"\x18\x00\x00\x00\x30\xf2\x77\x80"
	"single_release\0\0"
	"\x14\x00\x00\x00\xbb\x6d\xfb\xbd"
	"__fentry__\0\0"
	"\x14\x00\x00\x00\xa3\x75\xe5\x88"
	"single_open\0"
	"\x1c\x00\x00\x00\xca\x39\x82\x5b"
	"__x86_return_thunk\0\0"
	"\x1c\x00\x00\x00\xac\x98\x79\xc9"
	"remove_proc_entry\0\0\0"
	"\x10\x00\x00\x00\x7e\x3a\x2c\x12"
	"_printk\0"
	"\x18\x00\x00\x00\x34\x61\x23\x68"
	"module_layout\0\0\0"
	"\x00\x00\x00\x00\x00\x00\x00\x00";

MODULE_INFO(depends, "");


MODULE_INFO(srcversion, "DC8B75D3B80C1308455E9ED");
