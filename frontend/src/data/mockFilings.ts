import { Filing } from "./types";

const today = new Date();
const fmt = (h: number) => {
  const d = new Date(today);
  d.setHours(h, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
};

export const mockFilings: Filing[] = [
  { id: "1", ticker: "AAPL", companyName: "Apple Inc.", formType: "10-K", timestamp: fmt(9), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AAPL&type=10-K" },
  { id: "2", ticker: "MSFT", companyName: "Microsoft Corporation", formType: "10-Q", timestamp: fmt(9), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=MSFT&type=10-Q" },
  { id: "3", ticker: "GOOGL", companyName: "Alphabet Inc.", formType: "8-K", timestamp: fmt(10), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=GOOGL&type=8-K" },
  { id: "4", ticker: "AMZN", companyName: "Amazon.com Inc.", formType: "S-1", timestamp: fmt(10), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AMZN&type=S-1" },
  { id: "5", ticker: "TSLA", companyName: "Tesla Inc.", formType: "4", timestamp: fmt(11), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=TSLA&type=4" },
  { id: "6", ticker: "META", companyName: "Meta Platforms Inc.", formType: "10-Q", timestamp: fmt(11), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=META&type=10-Q" },
  { id: "7", ticker: "NVDA", companyName: "NVIDIA Corporation", formType: "8-K", timestamp: fmt(12), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=NVDA&type=8-K" },
  { id: "8", ticker: "JPM", companyName: "JPMorgan Chase & Co.", formType: "10-K", timestamp: fmt(12), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=JPM&type=10-K" },
  { id: "9", ticker: "V", companyName: "Visa Inc.", formType: "DEF 14A", timestamp: fmt(13), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=V&type=DEF-14A" },
  { id: "10", ticker: "AAPL", companyName: "Apple Inc.", formType: "8-K", timestamp: fmt(13), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AAPL&type=8-K" },
  { id: "11", ticker: "MSFT", companyName: "Microsoft Corporation", formType: "4", timestamp: fmt(14), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=MSFT&type=4" },
  { id: "12", ticker: "GOOGL", companyName: "Alphabet Inc.", formType: "SC 13G", timestamp: fmt(14), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=GOOGL&type=SC-13G" },
  { id: "13", ticker: "AMZN", companyName: "Amazon.com Inc.", formType: "10-Q", timestamp: fmt(15), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AMZN&type=10-Q" },
  { id: "14", ticker: "TSLA", companyName: "Tesla Inc.", formType: "8-K", timestamp: fmt(15), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=TSLA&type=8-K" },
  { id: "15", ticker: "NVDA", companyName: "NVIDIA Corporation", formType: "10-K", timestamp: fmt(16), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=NVDA&type=10-K" },
  { id: "16", ticker: "META", companyName: "Meta Platforms Inc.", formType: "S-1", timestamp: fmt(16), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=META&type=S-1" },
  { id: "17", ticker: "JPM", companyName: "JPMorgan Chase & Co.", formType: "4", timestamp: fmt(9), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=JPM&type=4" },
  { id: "18", ticker: "V", companyName: "Visa Inc.", formType: "10-Q", timestamp: fmt(10), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=V&type=10-Q" },
  { id: "19", ticker: "AAPL", companyName: "Apple Inc.", formType: "SC 13G", timestamp: fmt(11), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AAPL&type=SC-13G" },
  { id: "20", ticker: "TSLA", companyName: "Tesla Inc.", formType: "DEF 14A", timestamp: fmt(14), filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=TSLA&type=DEF-14A" },
];
