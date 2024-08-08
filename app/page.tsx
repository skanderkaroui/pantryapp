"use client";

import PantryPage from "./PantryPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pantry Tracker - My App",
  description: "Manage and track your pantry items effectively.",
};

export default function Home() {
  return <PantryPage />;
}
