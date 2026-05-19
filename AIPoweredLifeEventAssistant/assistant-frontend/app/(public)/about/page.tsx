import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FileText,
  Target,
  Eye,
  Users,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  Heart,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-xl"
          >
            <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-md" />
            <span>Дигитален асистент за животни настани</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Почетна
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-primary hover:text-primary transition-colors"
            >
              За нас
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Контакт/ЧПП
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild>
              <Link href="/login">Најави се</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Shield className="size-4" />
                <span>Официјална платформа за јавни услуги</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
                Дигитализација на{" "}
                <span className="text-primary">јавните услуги</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                Дигиталниот асистент за животни настани е платформа создадена со
                цел да го поедностави пристапот до јавните услуги и да им
                помогне на граѓаните да ги завршат административните процедури
                побрзо и поефикасно.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-8">
                  {/* ICON + TITLE CENTERED */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Target className="size-7 text-primary" />
                      </div>

                      <h2 className="text-2xl font-bold text-foreground">
                        Наша мисија
                      </h2>
                    </div>
                  </div>

                  {/* TEXT JUSTIFIED */}
                  <p className="text-muted-foreground leading-relaxed text-justify">
                    Да создадеме дигитална платформа која ќе им овозможи на
                    граѓаните лесен и брз пристап до информации за јавните
                    услуги, потребните документи и процедури за различни животни
                    настани. Нашата цел е да ја намалиме бирократијата и да го
                    олесниме секојдневниот живот на граѓаните.
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Eye className="size-7 text-primary" />
                    </div>

                    <h2 className="text-2xl font-bold text-foreground">
                      Наша визија
                    </h2>
                  </div>
                  <br></br>
                  <p className="text-muted-foreground leading-relaxed text-justify">
                    Дигитализација на јавната администрација која ќе го подобри
                    квалитетот на услугите и ќе ја зголеми транспарентноста во
                    работата на државните институции. Визијата ни е секој
                    граѓанин да може да пристапи до сите јавни услуги од
                    удобноста на својот дом.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Наши вредности
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Принципите кои нѐ водат во секојдневната работа
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Users className="size-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Граѓаните на прво место
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Сите наши одлуки се водени од потребите на граѓаните
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <CheckCircle className="size-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Транспарентност
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Јасни и точни информации за сите процедури
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Zap className="size-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Иновација
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Континуирано подобрување на услугите
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Heart className="size-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Посветеност
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Целосна посветеност кон квалитетна услуга
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  10+
                </p>
                <p className="text-muted-foreground">Животни настани</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  50+
                </p>
                <p className="text-muted-foreground">Јавни услуги</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  24/7
                </p>
                <p className="text-muted-foreground">Достапност</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  100%
                </p>
                <p className="text-muted-foreground">Бесплатно</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
              Имате прашања?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 text-lg">
              Контактирајте не или проверете ги често поставуваните прашања
            </p>
            <Button size="lg" variant="secondary" asChild className="h-12 px-8">
              <Link href="/contact">
                <span>Контактирајте не</span>
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Дигитален асистент за животни
              настани. Сите права се задржани.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
