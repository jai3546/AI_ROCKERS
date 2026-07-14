import { toPng, toJpeg } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

export interface ExportFlashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  syllabus: "AP" | "Telangana" | "CBSE" | "General";
}

/**
 * Export flashcards as TXT
 */
export function downloadTXT(cards: ExportFlashcard[]) {
  let content = "Flashcards\n";
  content += "=============================\n\n";

  cards.forEach((card, index) => {
    content += `Card ${index + 1}\n`;
    content += `Subject: ${card.subject}\n`;
    content += `Front: ${card.front}\n`;
    content += `Back : ${card.back}\n`;
    content += "\n--------------------------------------\n\n";
  });

  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  saveAs(blob, "flashcards.txt");
}

/**
 * Export all flashcards as PNG images inside a ZIP
 */
export async function downloadPNGZip(cards: ExportFlashcard[]) {
  const zip = new JSZip();

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    const front = document.getElementById(`front-${card.id}`);
    const back = document.getElementById(`back-${card.id}`);

    if (!front || !back) continue;

    // wait for rendering
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    // ---------- FRONT ----------
    const frontDataUrl = await toPng(front, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    const frontBlob = await fetch(frontDataUrl).then((r) => r.blob());

    zip.file(
      `flashcard-${String(i + 1).padStart(2, "0")}-front.png`,
      frontBlob
    );

    // ---------- BACK ----------
    const backDataUrl = await toPng(back, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    const backBlob = await fetch(backDataUrl).then((r) => r.blob());

    zip.file(
      `flashcard-${String(i + 1).padStart(2, "0")}-back.png`,
      backBlob
    );
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });

  saveAs(blob, "flashcards.zip");
}

/**
 * Export all flashcards as JPG images inside a ZIP
 */
export async function downloadJPGZip(cards: ExportFlashcard[]) {
  const zip = new JSZip();

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    const front = document.getElementById(`front-${card.id}`);
    const back = document.getElementById(`back-${card.id}`);

    if (!front || !back) continue;

    await new Promise((resolve) =>
      requestAnimationFrame(() => resolve(null))
    );

    // ---------- FRONT ----------
    const frontDataUrl = await toJpeg(front, {
      pixelRatio: 3,
      quality: 1,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    const frontBlob = await fetch(frontDataUrl).then((r) => r.blob());

    zip.file(
      `flashcard-${String(i + 1).padStart(2, "0")}-front.jpg`,
      frontBlob
    );

    // ---------- BACK ----------
    const backDataUrl = await toJpeg(back, {
      pixelRatio: 3,
      quality: 1,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    const backBlob = await fetch(backDataUrl).then((r) => r.blob());

    zip.file(
      `flashcard-${String(i + 1).padStart(2, "0")}-back.jpg`,
      backBlob
    );
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });

  saveAs(blob, "flashcards.zip");
}

/**
 * Export all flashcards as PDF
 */
export async function downloadPDF(cards: ExportFlashcard[]) {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [900, 600], // Match FlashcardExport dimensions
  });

  let isFirstPage = true;

  for (const card of cards) {
    const front = document.getElementById(`front-${card.id}`);
    const back = document.getElementById(`back-${card.id}`);

    if (!front || !back) continue;

    await new Promise((resolve) =>
      requestAnimationFrame(() => resolve(null))
    );

    // ---------- FRONT ----------
    const frontImage = await toPng(front, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    if (!isFirstPage) {
      pdf.addPage([900, 600], "landscape");
    }

    pdf.addImage(
      frontImage,
      "PNG",
      0,
      0,
      900,
      600
    );

    isFirstPage = false;

    // ---------- BACK ----------
    const backImage = await toPng(back, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    pdf.addPage();

    pdf.addImage({
    imageData: backImage,
    format: "PNG",
    x: 0,
    y: 0,
    width: 900,
    height: 600,
    });
  }

  pdf.save("flashcards.pdf");
}