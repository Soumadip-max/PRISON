/*
 * PRISON eBPF Kernel Probes (OSEN Track)
 * Intercepts sys_enter_execve, sys_enter_connect, and sys_enter_openat tracepoints.
 */

#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/fs.h>
#include <linux/socket.h>

#define TASK_COMM_LEN 16
#define MAX_ARG_LEN 256

enum event_type {
    EVENT_EXECVE = 1,
    EVENT_CONNECT = 2,
    EVENT_OPENAT = 3
};

struct syscall_event_t {
    u64 timestamp;
    u32 pid;
    u32 ppid;
    u32 type;
    char comm[TASK_COMM_LEN];
    char details[MAX_ARG_LEN];
};

BPF_PERF_OUTPUT(syscall_events);

/* Trace sys_enter_execve for process spawns & command arguments */
SEC("tracepoint/syscalls/sys_enter_execve")
int trace_execve(struct trace_event_raw_sys_enter* ctx) {
    u64 id = bpf_get_current_pid_tgid();
    u32 pid = id >> 32;

    struct task_struct *task;
    task = (struct task_struct *)bpf_get_current_task();

    struct syscall_event_t event = {};
    event.timestamp = bpf_ktime_get_ns();
    event.pid = pid;
    event.ppid = task->real_parent->pid;
    event.type = EVENT_EXECVE;
    bpf_get_current_comm(&event.comm, sizeof(event.comm));

    const char *filename = (const char *)ctx->args[0];
    bpf_probe_read_str(&event.details, sizeof(event.details), filename);

    syscall_events.perf_submit(ctx, &event, sizeof(event));
    return 0;
}

/* Trace sys_enter_connect for network socket initiation */
SEC("tracepoint/syscalls/sys_enter_connect")
int trace_connect(struct trace_event_raw_sys_enter* ctx) {
    u64 id = bpf_get_current_pid_tgid();
    u32 pid = id >> 32;

    struct task_struct *task;
    task = (struct task_struct *)bpf_get_current_task();

    struct syscall_event_t event = {};
    event.timestamp = bpf_ktime_get_ns();
    event.pid = pid;
    event.ppid = task->real_parent->pid;
    event.type = EVENT_CONNECT;
    bpf_get_current_comm(&event.comm, sizeof(event.comm));

    // Store address descriptor details
    bpf_probe_read_str(&event.details, sizeof(event.details), "socket_connect");

    syscall_events.perf_submit(ctx, &event, sizeof(event));
    return 0;
}

/* Trace sys_enter_openat for sensitive file access & honeypots */
SEC("tracepoint/syscalls/sys_enter_openat")
int trace_openat(struct trace_event_raw_sys_enter* ctx) {
    u64 id = bpf_get_current_pid_tgid();
    u32 pid = id >> 32;

    struct task_struct *task;
    task = (struct task_struct *)bpf_get_current_task();

    struct syscall_event_t event = {};
    event.timestamp = bpf_ktime_get_ns();
    event.pid = pid;
    event.ppid = task->real_parent->pid;
    event.type = EVENT_OPENAT;
    bpf_get_current_comm(&event.comm, sizeof(event.comm));

    const char *filename = (const char *)ctx->args[1];
    bpf_probe_read_str(&event.details, sizeof(event.details), filename);

    syscall_events.perf_submit(ctx, &event, sizeof(event));
    return 0;
}
