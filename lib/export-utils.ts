export function exportToCSV(
    data: Record<string, unknown>[],
    columns: { key: string; header: string }[],
    filename: string,
) {
    const header = columns.map((c) => c.header).join(",");
    const rows = data.map((row) =>
        columns
            .map((c) => {
                const val = row[c.key];
                if (val === null || val === undefined) return "";
                const str = String(val);
                return str.includes(",") ||
                    str.includes('"') ||
                    str.includes("\n")
                    ? `"${str.replace(/"/g, '""')}"`
                    : str;
            })
            .join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
