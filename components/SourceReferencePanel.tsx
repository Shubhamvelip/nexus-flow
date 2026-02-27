'use client';

import { Card } from '@/components/ui/card';
import { FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface SourceReferencePanelProps {
  policyTitle: string;
  source?: string;
  content?: string;
}

const sampleContent = `SMART ZONING & RENT TRANSPARENCY POLICY

Section 1: Purpose
This policy establishes guidelines for zoning classifications and ensures transparency in rental practices to promote equitable housing access.

Section 2: Zoning Classifications
2.1 Residential Zones
- Low-density: 0-20 units/acre
- Medium-density: 20-50 units/acre
- High-density: 50+ units/acre

2.2 Commercial Zones
- General retail
- Mixed-use development
- Office space

Section 3: Rent Transparency Requirements
3.1 Disclosure Obligations
All landlords must disclose:
- Annual rent increases (cannot exceed 5%)
- Maintenance responsibilities
- Lease term conditions

3.2 Register Requirements
- Rent must be registered with local authority
- Annual review and approval required

Section 4: Implementation Timeline
- Phase 1: Q1 2024 - Initial registration
- Phase 2: Q2 2024 - Compliance audits
- Phase 3: Q3 2024 - Full enforcement`;

export function SourceReferencePanel({
  policyTitle,
  source,
  content = sampleContent,
}: SourceReferencePanelProps) {
  const contentLines = content.split('\n');
  const highlightedLines = contentLines.map((line, idx) => {
    const isHighlighted =
      line.toLowerCase().includes('section') ||
      line.toLowerCase().includes('requirements') ||
      line.toLowerCase().includes('density');
    return { line, idx, isHighlighted };
  });

  return (
    <Card className="bg-card border-border overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border space-y-2">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {policyTitle}
            </h3>
            {source && (
              <p className="text-xs text-muted-foreground mt-1">{source}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-3 font-mono text-xs leading-relaxed">
        {highlightedLines.map(({ line, idx, isHighlighted }) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.02 }}
            className={`transition-colors ${
              isHighlighted
                ? 'bg-primary/20 px-2 py-1 rounded text-primary font-semibold'
                : 'text-muted-foreground'
            }`}
          >
            {line || <span>&nbsp;</span>}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/50">
        <button className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
          <ExternalLink className="w-4 h-4" />
          View Full Document
        </button>
      </div>
    </Card>
  );
}
