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
  hideTicker?: boolean;
}

const formColors: Record<string, string> = {
  "10-K": "bg-primary/20 text-primary border-primary/30",
  "10-Q": "bg-chart-2/20 text-accent border-accent/30",
  "8-K": "bg-chart-3/20 text-chart-3 border-chart-3/30",
  "S-1": "bg-chart-4/20 text-chart-4 border-chart-4/30",
  "4": "bg-chart-5/20 text-chart-5 border-chart-5/30",
  "3": "bg-chart-5/20 text-chart-5 border-chart-5/30",
  "144": "bg-card text-card-foreground border-border",
  "SCHEDULE 13G": "bg-secondary text-secondary-foreground border-border",
  "DEF 14A": "bg-muted text-muted-foreground border-border",
};

const FilingsTable = ({ filings, title, hideTicker }: FilingsTableProps) => {
  const formatDate = (ts: string) => {
    if (!ts) return "—";
    const dt = new Date(ts + "T12:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

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
            {!hideTicker && <TableHead className="text-muted-foreground">Ticker</TableHead>}
            {!hideTicker && <TableHead className="text-muted-foreground">Company</TableHead>}
            <TableHead className="text-muted-foreground">Form</TableHead>
            <TableHead className="text-muted-foreground">Date Filed</TableHead>
            <TableHead className="text-muted-foreground">View Filing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hideTicker ? 3 : 5} className="text-center text-muted-foreground py-8">
                No filings found
              </TableCell>
            </TableRow>
          ) : (
            filings.map((f) => (
              <TableRow key={f.id} className="border-border hover:bg-secondary/50">
                {!hideTicker && (
                  <TableCell className="font-mono font-medium text-primary">{f.ticker}</TableCell>
                )}
                {!hideTicker && (
                  <TableCell className="text-sm">{f.companyName}</TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={formColors[f.formType] || ""}>
                      {f.formType}
                    </Badge>
                    {f.isAmendment && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                        Amendment
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {formatDate(f.timestamp)}
                </TableCell>
                <TableCell>
                  <a
                    href={f.filingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    view in edgar →
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
