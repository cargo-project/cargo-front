"use client";
import type { ReactNode } from "react";
export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) { return <header className="page-heading page-heading--section"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</header>; }
