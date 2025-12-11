import { MessageCircle, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">ChatApp</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Real-time messaging
              <br />
              <span className="text-primary">made simple</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Connect with your team instantly. Create rooms, send direct messages, and collaborate in real-time with our modern chat application.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login">Get Started</a>
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
              Everything you need to communicate
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Real-time Messaging</h3>
                  <p className="text-sm text-muted-foreground">
                    Send and receive messages instantly with WebSocket technology.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Chat Rooms</h3>
                  <p className="text-sm text-muted-foreground">
                    Create public or private rooms to organize conversations by topic.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Direct Messages</h3>
                  <p className="text-sm text-muted-foreground">
                    Start private conversations with team members one-on-one.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your messages are stored securely with authentication protection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join now and start communicating with your team in real-time.
            </p>
            <Button size="lg" asChild data-testid="button-join-now">
              <a href="/api/login">Join Now</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with real-time WebSocket technology</p>
        </div>
      </footer>
    </div>
  );
}
