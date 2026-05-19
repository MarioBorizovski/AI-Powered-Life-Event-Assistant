"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { Request, RequestResult } from "@/lib/mock-api";
import { LIFE_EVENTS } from "@/lib/mock-api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const statusLabels: Record<string, string> = {
  pending: "Во тек",
  completed: "Завршено",
  cancelled: "Откажано",
};

interface PDFExportProps {
  request: Request;
  result: RequestResult;
  variant?: "default" | "outline";
  className?: string;
}

export function PDFExport({
  request,
  result,
  variant = "outline",
  className,
}: PDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const getLifeEventLabel = (value: string) => {
    return LIFE_EVENTS.find((e) => e.value === value)?.label || value;
  };

  const completedTodos = result.todos.filter((t) => t.completed).length;
  const totalTodos = result.todos.length;
  const progressPercentage =
    totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const handleExportPDF = async () => {
    if (isExporting) return;

    setIsExporting(true);
    toast.loading("Се подготвува PDF...", { id: "pdf-export" });

    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Ве молиме дозволете pop-up прозорци", {
          id: "pdf-export",
        });
        setIsExporting(false);
        return;
      }

      const lifeEventLabel = getLifeEventLabel(request.lifeEvent);
      const dateStr = new Date(request.createdAt).toLocaleDateString("mk-MK");
      const currentYear = new Date().getFullYear();

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="mk">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title >Дигитален асистент за животни настани - Извештај за барање</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              line-height: 1.6;
              padding: 0;
            }
            .page {
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              background: linear-gradient(135deg, #1e3a5f 0%, #2b4a7c 100%);
              color: white;
              padding: 30px 40px;
              margin: -40px -40px 30px -40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header h1 {
              font-size: 20px;
              font-weight: bold;
            }
            .header span {
              font-size: 14px;
              opacity: 0.9;
            }
            .title {
              color: #1e3a5f;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }
            .info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .info p {
              margin: 5px 0;
              color: #64748b;
            }
            .info strong {
              color: #1e3a5f;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              background: #f0f5fa;
              color: #1e3a5f;
              font-size: 16px;
              font-weight: bold;
              padding: 12px 15px;
              border-radius: 6px;
              margin-bottom: 15px;
            }
            .todo-item {
              display: flex;
              align-items: flex-start;
              gap: 10px;
              padding: 12px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              margin-bottom: 10px;
            }
            .checkbox {
              width: 18px;
              height: 18px;
              border: 2px solid #cbd5e1;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              margin-top: 2px;
            }
            .checkbox.checked {
              background: #22c55e;
              border-color: #22c55e;
              color: white;
            }
            .todo-content {
              flex: 1;
            }
            .todo-title {
              font-weight: 600;
              color: #1e3a5f;
              margin-bottom: 4px;
            }
            .todo-title.completed {
              text-decoration: line-through;
              color: #94a3b8;
            }
            .todo-description {
              font-size: 13px;
              color: #64748b;
              margin-bottom: 6px;
            }
            .todo-meta {
              display: flex;
              gap: 15px;
              font-size: 12px;
            }
            .todo-deadline {
              color: #64748b;
            }
            .todo-priority {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            }
            .priority-high {
              background: #fef2f2;
              color: #dc2626;
            }
            .priority-medium {
              background: #fefce8;
              color: #ca8a04;
            }
            .priority-low {
              background: #f0fdf4;
              color: #16a34a;
            }
            .doc-item {
              background: #fff;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 10px;
            }
            .doc-name {
              font-weight: 600;
              color: #1e3a5f;
              margin-bottom: 5px;
            }
            .doc-badge {
              display: inline-block;
              font-size: 11px;
              padding: 2px 8px;
              border-radius: 4px;
              margin-left: 10px;
            }
            .doc-badge.required {
              background: #fef2f2;
              color: #dc2626;
            }
            .doc-badge.optional {
              background: #f1f5f9;
              color: #64748b;
            }
            .doc-desc {
              font-size: 14px;
              color: #64748b;
            }
            .service-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .service-item {
              background: #fff;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
            }
            .service-name {
              font-weight: 600;
              color: #1e3a5f;
              margin-bottom: 5px;
            }
            .service-desc {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 8px;
            }
            .service-location {
              font-size: 13px;
              color: #94a3b8;
            }
            .progress-bar {
              background: #e5e7eb;
              height: 12px;
              border-radius: 6px;
              overflow: hidden;
              margin-bottom: 8px;
            }
            .progress-fill {
              background: #22c55e;
              height: 100%;
              border-radius: 6px;
            }
            .progress-text {
              text-align: right;
              font-weight: 600;
              color: #22c55e;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #94a3b8;
            }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .page { padding: 20px; }
              .header { margin: -20px -20px 20px -20px; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <h1>Дигитален асистент за животни настани</h1>
              <span>Дигитални јавни услуги</span>
            </div>
            
            <h2 class="title">Извештај за барање</h2>
            
            <div class="info">
              <p><strong>Животен настан:</strong> ${lifeEventLabel}</p>
              <p><strong>Датум:</strong> ${dateStr}</p>
              <p><strong>Статус:</strong> ${statusLabels[request.status]}</p>
              <p><strong>Прогрес:</strong> ${progressPercentage}% завршено</p>
            </div>

            <div class="section">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
              </div>
              <p class="progress-text">${progressPercentage}%</p>
            </div>

            <div class="section">
              <div class="section-title">Листа на задачи</div>
              ${result.todos
                .map((todo) => {
                  const priorityLabels: Record<string, string> = {
                    high: "Висок",
                    medium: "Среден",
                    low: "Низок",
                  };
                  const deadlineDate = new Date(
                    todo.deadline,
                  ).toLocaleDateString("mk-MK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  return `
                <div class="todo-item">
                  <div class="checkbox ${todo.completed ? "checked" : ""}">${todo.completed ? "✓" : ""}</div>
                  <div class="todo-content">
                    <div class="todo-title ${todo.completed ? "completed" : ""}">${todo.text}</div>
                    <p class="todo-description">${todo.description}</p>
                    <div class="todo-meta">
                      <span class="todo-deadline">Рок: ${deadlineDate}</span>
                      <span class="todo-priority priority-${todo.priority}">${priorityLabels[todo.priority]} приоритет</span>
                    </div>
                  </div>
                </div>
              `;
                })
                .join("")}
            </div>

            <div class="section">
              <div class="section-title">Потребни документи</div>
              ${result.documents
                .map(
                  (doc) => `
                <div class="doc-item">
                  <div class="doc-name">
                    ${doc.name}
                    <span class="doc-badge ${doc.required ? "required" : "optional"}">
                      ${doc.required ? "Задолжително" : "Опционално"}
                    </span>
                  </div>
                  <p class="doc-desc">${doc.description}</p>
                </div>
              `,
                )
                .join("")}
            </div>

            <div class="section">
              <div class="section-title">Јавни сервиси</div>
              <div class="service-grid">
                ${result.services
                  .map(
                    (service) => `
                  <div class="service-item">
                    <div class="service-name">${service.name}</div>
                    <p class="service-desc">${service.description}</p>
                    <p class="service-location">📍 ${service.location}</p>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>

            <div class="footer">
              <span>© ${currentYear} Дигитален асистент за животни настани - Сите права задржани</span>
              <span>Генерирано: ${new Date().toLocaleDateString("mk-MK")}</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      toast.success("PDF е подготвен за печатење!", { id: "pdf-export" });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Грешка при генерирање на PDF", { id: "pdf-export" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleExportPDF}
      disabled={isExporting}
      className={className}
    >
      <Download className="size-4" />
      <span>{isExporting ? "Се подготвува..." : "Преземи PDF"}</span>
    </Button>
  );
}
