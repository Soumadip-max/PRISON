"""
MicroVM and Sandbox Configuration Settings.
"""

from pydantic import BaseModel


class VMConfig(BaseModel):
    vcpu_count: int = 2
    mem_size_mib: int = 1024
    boot_timeout_ms: int = 150
    default_execution_timeout_sec: int = 30
    kernel_image_path: str = "/var/lib/prison/vmlinux"
    rootfs_image_path: str = "/var/lib/prison/rootfs.ext4"
    enable_firecracker: bool = False  # Docker/process container fallback if Firecracker disabled
    network_isolated: bool = True
