import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OverviewChart() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Chart Placeholder
                </div>
            </CardContent>
        </Card>
    );
}
