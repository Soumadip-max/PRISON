"""
Attack Execution Path Generator for ANAKIN.
Converts normalized execution DAGs into human-readable Markdown attack trees for PR comments.
"""

from services.telemetry.schemas.graph import ExecutionDAG, NodeType


class AttackTreeGenerator:
    """
    Parses ExecutionDAG into formatted Markdown tree visualizations.
    """

    @staticmethod
    def generate_markdown(dag: ExecutionDAG) -> str:
        """
        Renders a Markdown tree of the process execution DAG.
        """
        lines = [
            f"### 🛡️ PRISON Execution Attack Tree (ID: `{dag.execution_id}`)",
            "",
            "| Node Type | Status Indicator | Description |",
            "| :--- | :--- | :--- |",
            "| `BLUE_STANDARD` | 🔵 Clean Step | Expected build execution step |",
            "| `AMBER_HONEYPOT` | ⚠️ Honeypot Hit | Synthetic decoy secret access attempt |",
            "| `RED_MALICIOUS` | 🚨 Malicious Exec | Suspicious binary / socket connection |",
            "",
            "#### Process Execution Hierarchy:",
            "```text",
        ]

        if not dag.nodes:
            lines.append("  (No execution nodes recorded)")
        else:
            # Build hierarchy map ppid -> list of child nodes
            parent_map = {}
            for node in dag.nodes:
                parent_map.setdefault(node.ppid, []).append(node)

            def render_node(node, prefix=""):
                icon = "🔵"
                if node.node_type == NodeType.AMBER_HONEYPOT:
                    icon = "⚠️ [HONEYPOT TRAP]"
                elif node.node_type == NodeType.RED_MALICIOUS:
                    icon = "🚨 [MALICIOUS SYSCALL]"
                
                lines.append(f"{prefix}├── {icon} PID {node.pid} ({node.comm}): {node.label}")

                children = parent_map.get(node.pid, [])
                for i, child in enumerate(children):
                    child_prefix = prefix + ("│   " if i < len(children) - 1 else "    ")
                    render_node(child, child_prefix)

            # Find root processes (ppid not in pids or ppid == 0)
            pids = {n.pid for n in dag.nodes}
            roots = [n for n in dag.nodes if n.ppid not in pids or n.ppid == 0]
            if not roots:
                roots = dag.nodes[:1]

            for root in roots:
                render_node(root)

        lines.append("```")
        lines.append("")
        return "\n".join(lines)
