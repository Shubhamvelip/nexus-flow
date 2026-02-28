import { jsPDF } from 'jspdf';
import { PolicyChecklistItem, PolicyDecisionTree, PolicyWorkflowStep } from './firebase';

export function exportPolicyToPDF({
    title,
    description,
    workflow,
    decisionTree,
    checklist,
}: {
    title: string;
    description: string;
    workflow: PolicyWorkflowStep[];
    decisionTree: PolicyDecisionTree;
    checklist: PolicyChecklistItem[];
}) {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Helper to add lines with automatic page breaks
    const addTextLines = (lines: string[], fontSize = 12, isBold = false) => {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setFontSize(fontSize);

        for (const line of lines) {
            // Approx line height in mm based on font size (1 pt = 0.3527 mm)
            const lineHeight = fontSize * 0.3527 * 1.5;
            if (y + lineHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += lineHeight;
        }
    };

    const addSpacing = (mm: number) => {
        y += mm;
        if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };

    // ── Title ──
    const titleLines = doc.splitTextToSize(title, contentWidth);
    addTextLines(titleLines, 22, true);
    addSpacing(5);

    // ── Description ──
    if (description) {
        const descLines = doc.splitTextToSize(description, contentWidth);
        addTextLines(descLines, 12, false);
        addSpacing(10);
    }

    // ── Workflow ──
    if (workflow && workflow.length > 0) {
        addTextLines(['Workflow'], 16, true);
        addSpacing(3);
        workflow.forEach((step, idx) => {
            const stepTitle = `${idx + 1}. ${step.step}`;
            const stepTitleLines = doc.splitTextToSize(stepTitle, contentWidth);
            addTextLines(stepTitleLines, 12, true);

            if (step.description) {
                const descLines = doc.splitTextToSize(step.description, contentWidth - 10);
                // Indent description manually since doc.text coordinates handle margin
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                const lineHeight = 11 * 0.3527 * 1.5;
                for (const line of descLines) {
                    if (y + lineHeight > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(line, margin + 10, y);
                    y += lineHeight;
                }
            }
            addSpacing(4);
        });
        addSpacing(5);
    }

    // ── Decision Tree ──
    if (decisionTree && decisionTree.nodes && decisionTree.nodes.length > 0) {
        addTextLines(['Decision Tree'], 16, true);
        addSpacing(3);

        // Build adjacency for BFS display
        const adj = new Map<string, Array<{ to: string; condition?: string }>>();
        for (const e of (decisionTree.edges ?? [])) {
            if (!adj.has(e.from)) adj.set(e.from, []);
            adj.get(e.from)!.push({ to: e.to, condition: e.condition });
        }
        const nodeMap = new Map(decisionTree.nodes.map(n => [n.id, n]));

        // BFS order
        const visited = new Set<string>();
        const queue: Array<{ id: string; depth: number; prefix: string }> = [
            { id: decisionTree.start_node, depth: 0, prefix: '' }
        ];
        while (queue.length > 0) {
            const { id, depth, prefix } = queue.shift()!;
            if (visited.has(id)) continue;
            visited.add(id);
            const n = nodeMap.get(id);
            if (!n) continue;
            const indent = 10 * depth;
            const indentWidth = contentWidth - indent;
            const icon = n.type === 'decision' ? '? ' : '→ ';
            const text = `${prefix}${icon}${n.label}`;
            const lines = doc.splitTextToSize(text, indentWidth);
            doc.setFontSize(n.type === 'decision' ? 12 : 11);
            doc.setFont('helvetica', n.type === 'decision' ? 'bold' : 'normal');
            for (const line of lines) {
                const lh = (n.type === 'decision' ? 12 : 11) * 0.3527 * 1.5;
                if (y + lh > pageHeight - margin) { doc.addPage(); y = margin; }
                doc.text(line, margin + indent, y);
                y += lh;
            }
            for (const edge of (adj.get(id) ?? [])) {
                const condLabel = edge.condition === 'yes' ? '[YES] ' : edge.condition === 'no' ? '[NO] ' : '';
                queue.push({ id: edge.to, depth: depth + 1, prefix: condLabel });
            }
        }
        addSpacing(8);
    }


    // ── Checklist ──
    if (checklist && checklist.length > 0) {
        addTextLines(['Execution Checklist'], 16, true);
        addSpacing(3);
        checklist.forEach((item) => {
            const checkboxText = `[${item.completed ? 'X' : ' '}] ${item.title}`;
            const checkLines = doc.splitTextToSize(checkboxText, contentWidth - 5);
            addTextLines(checkLines, 12, false);
            addSpacing(2);
        });
    }

    // ── Save it ──
    // Build a safe filename
    const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    doc.save(`${safeTitle || 'policy'}.pdf`);
}
