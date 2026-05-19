"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  FileText,
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

const faqs = [
  {
    question: "Како да се регистрирам?",
    answer:
      'Кликнете на копчето "Регистрација" во горниот десен агол, пополнете ги бараните податоци и потврдете ја вашата е-пошта. Процесот е брз и едноставен.',
  },
  {
    question: "Дали услугата е бесплатна?",
    answer:
      "Да, платформата е целосно бесплатна за сите граѓани. Можете да креирате барања и да добивате информации без никакви трошоци.",
  },
  {
    question: "Како да генерирам ново барање?",
    answer:
      'Најавете се на вашата сметка, одете на "Генерирај барање" од менито, изберете го животниот настан и пополнете ги потребните информации. Системот автоматски ќе генерира листа на потребни документи и чекори.',
  },
  {
    question: "Дали моите податоци се заштитени?",
    answer:
      "Да, применуваме најсовремени безбедносни мерки за заштита на вашите лични податоци. Сите податоци се енкриптирани и чувани согласно законските регулативи за заштита на лични податоци.",
  },
  {
    question: "Како да ги преземам резултатите?",
    answer:
      'По завршување на барањето, на страницата со резултати ќе имате опција да го преземете целиот извештај како PDF документ. Кликнете на копчето "Преземи PDF".',
  },
  {
    question: "Што ако имам проблем со платформата?",
    answer:
      "Можете да не контактирате преку формуларот на оваа страница или да испратите е-пошта на support@euslugi.mk. Нашиот тим ќе ви одговори во рок од 24 часа.",
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
    toast.success("Вашата порака е испратена! Ќе ви одговориме наскоро.");
  };

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
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              За нас
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-primary hover:text-primary transition-colors"
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
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
          <div className="container mx-auto px-4 relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MessageCircle className="size-4" />
              <span>Тука сме да помогнеме</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Контакт и ЧПП
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Имате прашања? Проверете ги често поставуваните прашања или
              испратете ни порака директно.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/30 transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Mail className="size-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Е-пошта
                  </h3>
                  <p className="text-muted-foreground">support@euslugi.mk</p>
                </CardContent>
              </Card>

              <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/30 transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Phone className="size-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Телефон
                  </h3>
                  <p className="text-muted-foreground">+389 2 123 456</p>
                </CardContent>
              </Card>

              <Card className="group bg-card hover:bg-card/80 border-border hover:border-primary/30 transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="size-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Адреса</h3>
                  <p className="text-muted-foreground">
                    Бул. Илинден бр. 2, Скопје
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                    <Send className="size-5 text-primary" />
                    Испратете порака
                  </CardTitle>
                  <CardDescription>
                    Пополнете го формуларот и ќе ви одговориме во најкраток
                    можен рок
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <FieldGroup>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="name">Име и презиме</FieldLabel>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Петар Петровски"
                            required
                            disabled={isSubmitting}
                            className="h-11"
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="email">Е-пошта</FieldLabel>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="example@mail.com"
                            required
                            disabled={isSubmitting}
                            className="h-11"
                          />
                        </Field>
                      </div>
                      <Field>
                        <FieldLabel htmlFor="subject">Тема</FieldLabel>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subject: e.target.value,
                            })
                          }
                          placeholder="Тема на пораката"
                          required
                          disabled={isSubmitting}
                          className="h-11"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="message">Порака</FieldLabel>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          placeholder="Напишете ја вашата порака..."
                          rows={5}
                          required
                          disabled={isSubmitting}
                        />
                      </Field>
                    </FieldGroup>
                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner className="size-4" />
                          <span>Испраќање...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          <span>Испрати порака</span>
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Working Hours & Additional Info */}
              <div className="space-y-6">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="size-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          24/7 достапност
                        </h3>
                        <p className="text-muted-foreground">
                          Платформата е достапна во секое време – пристапете до
                          информации и насоки кога и да ви се потребни.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="size-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Брз одговор
                        </h3>
                        <p className="text-muted-foreground">
                          Нашиот тим одговара на сите пораки во рок од 24 часа
                          во работни денови. За итни прашања, ве молиме јавете
                          се на телефон.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <HelpCircle className="size-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Поддршка
                        </h3>
                        <p className="text-muted-foreground">
                          Ако имате технички проблеми со платформата, проверете
                          ги ЧПП подолу или контактирајте не директно за помош.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <HelpCircle className="size-4" />
                <span>ЧПП</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Често поставувани прашања
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Одговори на најчестите прашања од нашите корисници
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-border"
                      >
                        <AccordionTrigger className="text-left text-foreground hover:text-primary py-4">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
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
