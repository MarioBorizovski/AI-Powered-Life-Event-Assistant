"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationInbox } from '@/components/ui/notification-inbox';
import {
  FileText,
  ClipboardList,
  CheckCircle,
  Download,
  ArrowRight,
  Shield,
  Clock,
  Users,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Изберете животен настан",
    description:
      "Одберете го животниот настан за кој ви се потребни информации",
  },
  {
    icon: FileText,
    title: "Пополнете го барањето",
    description: "Внесете ги потребните информации за вашиот случај",
  },
  {
    icon: CheckCircle,
    title: "Добијте листа на задачи",
    description: "Системот генерира персонализирана листа на чекори",
  },
  {
    icon: Download,
    title: "Преземете PDF",
    description: "Експортирајте ги резултатите за лесна референца",
  },
];

const features = [
  {
    icon: Shield,
    title: "Сигурност",
    description:
      "Вашите податоци се заштитени со најсовремени безбедносни мерки",
  },
  {
    icon: Clock,
    title: "Заштеда на време",
    description:
      "Добијте сите потребни информации на едно место, брзо и едноставно",
  },
  {
    icon: Users,
    title: "Поддршка",
    description: "Нашиот тим е секогаш на располагање за помош и насоки",
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-xl"
          >
            <Image
              src="/logo.png"
              alt="logo"
              width={55}
              height={55}
              className="rounded-md"
            />
            <span>Дигитален асистент за животни настани</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Почетна
            </Link>
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
            <NotificationInbox />
            <ThemeToggle />
            {user ? (
              <Button asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  <span>Контролна табла</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/login">
                    <LogIn className="size-4" />
                    <span>Најава</span>
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register">
                    <UserPlus className="size-4" />
                    <span>Регистрација</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-shadow-blue-950 mb-6 text-balance">
              Дигитални јавни услуги на едно место
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Паметен водич низ административните процеси поврзани со клучни
              животни настани – организирано, јасно и практично.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard/new-request">
                    <ClipboardList className="size-5" />
                    <span>Ново барање</span>
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/register">
                      <span>Започнете бесплатно</span>
                      <ArrowRight className="size-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">
                      <span>Најавете се</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Како функционира?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Со само неколку чекори добивате комплетна листа на потребни
                документи и процедури.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <Card
                  key={index}
                  className="relative bg-card border-border hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="size-6 text-primary" />
                    </div>
                    <div className="absolute top-4 right-4 size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg text-card-foreground">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Зошто дигитален асистент за животни настани?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Платформа дизајнирана да го поедностави пристапот до јавните
                услуги
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="size-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Подготвени да започнете?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Регистрирајте се денес и добијте пристап до сите функционалности
              на платформата
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">
                    <span>Регистрирај се бесплатно</span>
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
              </div>
            )}
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
