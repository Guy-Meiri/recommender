import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <main className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Recommender App
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome to your personalized recommendation system
          </p>
        </div>

        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Tell us what you&apos;re looking for and we&apos;ll provide personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="What are you interested in?" />
            <Button className="w-full">
              Get Recommendations
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
