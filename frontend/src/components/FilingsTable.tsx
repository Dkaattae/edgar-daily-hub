import { Filing } from "@/data/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface FilingsTableProps {
  filings: Filing[];
  title?: string;
}

const formColors: Record<string, string> = {
  "10-K": "bg-primary/20 text-primary border-primary/30",
  "10-Q": "bg-chart-2/20 text-accent border-accent/30",
  "8-K": "bg-chart-3/20 text-chart-3 border-chart-3/30",
  "S-1": "bg-chart-4/20 text-chart-4 border-chart-4/30",
  "4": "bg-chart-5/20 text-chart-5 border-chart-5/30",
  "SC 13G": "bg-secondary text-secondary-foreground border-border",
  "DEF 14A": "bg-muted text-muted-foreground border-border",
};

const FilingsTable = ({ filings, title }: FilingsTableProps) => {
  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-lg border border-border bg-card">
      {title && (
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Ticker</TableHead>
            <TableHead className="text-muted-foreground">Company</TableHead>
            <TableHead className="text-muted-foreground">Form</TableHead>
            <TableHead className="text-muted-foreground">Time</TableHead>
            <TableHead className="text-muted-foreground">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No filings found
              </TableCell>
            </TableRow>
          ) : (
            filings.map((f) => (
              <TableRow key={f.id} className="border-border hover:bg-secondary/50">
                <TableCell className="font-mono font-medium text-primary">{f.ticker}</TableCell>
                <TableCell>{f.companyName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={formColors[f.formType] || ""}>
                    {f.formType}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {formatTime(f.timestamp)}
                </TableCell>
                <TableCell>
                  <a
                    href={f.filingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    View →
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FilingsTable;
