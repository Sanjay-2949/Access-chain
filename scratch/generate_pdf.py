import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

def build_pdf(filename="AccessChain_SIH_Pitch_Presentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        alignment=0
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0284c7')
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=12,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#0369a1'),
        alignment=0
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )

    elements = []

    # Title & Subtitle Header Banner
    elements.append(Paragraph("AccessChain — SIH Master Pitch & Technical Architecture", title_style))
    elements.append(Paragraph("Don't just find an accessible destination. Complete an accessible journey.", subtitle_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284c7'), spaceAfter=12))

    # Executive Summary Box
    summary_text = (
        "<b>Executive Summary:</b> AccessChain is a world-class accessibility intelligence platform "
        "built for tourism and sports. It evaluates accessibility as an <b>end-to-end continuous journey property</b> "
        "rather than isolated place attributes, calculating explicit feasibility across transport, accommodation, venue entrance, "
        "restrooms, and seating for travelers with diverse accessibility profiles."
    )
    summary_table = Table(
        [[Paragraph(summary_text, callout_style)]],
        colWidths=[540]
    )
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0f9ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bae6fd')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 10))

    # 1. CORE UNDERSTANDING OF THE PROBLEM
    elements.append(Paragraph("1. Core Understanding of the Problem", h1_style))
    p1_text = (
        "Current accessibility platforms evaluate destinations independently. A hotel, metro line, airport, or stadium may individually claim to be accessible, "
        "but a person's <b>entire journey fails if even one connecting link is inaccessible</b> (e.g. non-wheelchair vehicle, broken lift without ramp alternative). "
        "Travelers face fragmented, static, and unreliable information across multiple apps, leading to travel anxiety and unexpected stranded situations."
    )
    elements.append(Paragraph(p1_text, body_style))

    # 2. WHAT IS THE SOLUTION?
    elements.append(Paragraph("2. What is the Solution?", h1_style))
    p2_text = (
        "AccessChain models origin, transit steps, transfers, venue gates, internal corridors, elevators, seating, and restrooms as connected <b>Nodes</b> and <b>Edges</b> "
        "in an <b>Accessibility Continuity Graph</b>. It answers: <i>'Can THIS SPECIFIC PERSON with THEIR EXPLICIT ACCESSIBILITY REQUIREMENTS complete THIS ENTIRE JOURNEY?'</i> "
        "If a link breaks or suffers a live outage, AccessChain automatically detects single points of failure (SPOFs) and calculates smart alternatives (<i>'Find A Way'</i>)."
    )
    elements.append(Paragraph(p2_text, body_style))

    # 3. WHAT IS UNIQUELY PRESENT?
    elements.append(Paragraph("3. What is Uniquely Present?", h1_style))
    unique_items = [
        "<b>Accessibility Continuity Graph:</b> Node-edge spatial graph validating edge-by-edge constraints rather than simple place pin dropping.",
        "<b>Decoupled Three Core Metrics:</b> Decouples <i>FEASIBILITY</i> (FEASIBLE / NOT FEASIBLE), <i>ACCESSIBILITY QUALITY (0-100)</i>, and <i>JOURNEY RESILIENCE (0-100)</i>.",
        "<b>Tri-State Knowledge Engine:</b> Strictly enforces <i>UNKNOWN != FALSE</i> to prevent missing data from falsely assuming accessibility or inaccessibility.",
        "<b>Live Temporal Re-Evaluation:</b> Real-time graph updates (e.g., Gate 3 lift outage) trigger automatic re-evaluation via Gate 5 ramp.",
        "<b>SIH Interactive Demo Mode (/demo):</b> Deterministic 7-state demo machine simulating failure detection, 1-click shuttle repair, live outage, and rerouting."
    ]
    for u in unique_items:
        elements.append(Paragraph(f"• {u}", bullet_style))

    # 4. WHAT IS DIFFERENT FROM OTHER PLATFORMS?
    elements.append(Paragraph("4. What is Different from Other Platforms?", h1_style))
    diff_data = [
        [Paragraph("Feature / Aspect", table_header_style), Paragraph("Traditional Maps (Google Maps, TripAdvisor)", table_header_style), Paragraph("AccessChain (SIH Edition)", table_header_style)],
        [Paragraph("Evaluation Unit", table_cell_style), Paragraph("Point of Interest (POI) / Isolated Pin", table_cell_style), Paragraph("Continuous End-to-End Journey Graph", table_cell_style)],
        [Paragraph("Routing Logic", table_cell_style), Paragraph("Shortest time / distance", table_cell_style), Paragraph("Safest Feasible Accessible Journey", table_cell_style)],
        [Paragraph("Failure Detection", table_cell_style), Paragraph("None (Discovered on arrival)", table_cell_style), Paragraph("Proactive SPOF & Failure Diagnostics", table_cell_style)],
        [Paragraph("Missing Data", table_cell_style), Paragraph("Assumes accessible or ignores", table_cell_style), Paragraph("Enforces UNKNOWN != FALSE & offers alternatives", table_cell_style)],
        [Paragraph("Temporal Status", table_cell_style), Paragraph("Static text labels", table_cell_style), Paragraph("Real-time temporal status with outage rerouting", table_cell_style)],
    ]
    diff_table = Table(diff_data, colWidths=[110, 215, 215])
    diff_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(diff_table)

    # 5. BENCHMARK: OURS VS COMPETITORS
    elements.append(Paragraph("5. Benchmark: Ours vs Competitors", h1_style))
    bench_data = [
        [Paragraph("Benchmark Criteria", table_header_style), Paragraph("Google Maps", table_header_style), Paragraph("Wheelmap", table_header_style), Paragraph("AccessChain", table_header_style)],
        [Paragraph("End-to-End Continuity", table_cell_style), Paragraph("No", table_cell_style), Paragraph("No", table_cell_style), Paragraph("100% Graph-Based", table_cell_style)],
        [Paragraph("Multi-Constraint Matching", table_cell_style), Paragraph("Partial", table_cell_style), Paragraph("No", table_cell_style), Paragraph("Full (Slope, Lift, Transit, Restroom)", table_cell_style)],
        [Paragraph("Live Outage Rerouting", table_cell_style), Paragraph("No", table_cell_style), Paragraph("No", table_cell_style), Paragraph("Real-Time Automated Reroute", table_cell_style)],
        [Paragraph("SPOF & Resilience Metric", table_cell_style), Paragraph("No", table_cell_style), Paragraph("No", table_cell_style), Paragraph("SPOF Counter & Resilience Score", table_cell_style)],
        [Paragraph("Explainable Routing", table_cell_style), Paragraph("No", table_cell_style), Paragraph("No", table_cell_style), Paragraph("Human-Readable Diagnostic Cards", table_cell_style)],
    ]
    bench_table = Table(bench_data, colWidths=[150, 130, 130, 130])
    bench_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0369a1')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(bench_table)

    # 6. BUSINESS PATH & REVENUE MODEL
    elements.append(Paragraph("6. Business Path & Revenue Model", h1_style))
    biz_items = [
        "<b>B2C (Freemium):</b> Free basic journey discovery; Premium subscriptions for para-athletes & frequent travelers.",
        "<b>B2B (SaaS for Venues & Hotels):</b> Annual subscription for stadium operators, hotels, and event organizers to monitor live infrastructure and maintain accessibility compliance.",
        "<b>B2G (Government & Cities):</b> City-wide accessibility gap heatmaps & urban planning intelligence licenses.",
        "<b>API Infrastructure Layer:</b> Data licensing API for booking platforms (MakeMyTrip, Booking.com), airlines, railways, and map providers."
    ]
    for b in biz_items:
        elements.append(Paragraph(f"• {b}", bullet_style))

    # 7. TOOLS USED IN DEVELOPMENT
    elements.append(Paragraph("7. Tools Used in Development", h1_style))
    tools_items = [
        "<b>IDE & Workspace:</b> Antigravity IDE (Gemini 3.6 Flash / Pro multi-agent execution engine).",
        "<b>Runtime & Package Manager:</b> Node.js v24, npm 11, TypeScript Compiler (<i>tsc</i>).",
        "<b>Testing & Linters:</b> Vitest unit testing framework, PostCSS, Tailwind CSS JIT compiler."
    ]
    for t in tools_items:
        elements.append(Paragraph(f"• {t}", bullet_style))

    # 8. TECH, FRAMEWORKS, AND ALGORITHMS USED TO BUILD FOR SIH
    elements.append(Paragraph("8. Tech, Frameworks, and Algorithms Used for SIH", h1_style))
    tech_items = [
        "<b>Frontend & UI:</b> Next.js 14+ (App Router, React 19, TypeScript), Tailwind CSS, Lucide Icons, Framer Motion, Canvas Confetti.",
        "<b>State Management:</b> Zustand (Global profile manager, graph engine state, SIH demo state machine).",
        "<b>Database Schema:</b> Prisma ORM with PostgreSQL + PostGIS spatial data baseline.",
        "<b>Routing Algorithm (Dijkstra / A* Multi-Constraint):</b> Evaluates candidate graph edges, filtering infeasible links before performing multi-objective optimization for time, cost, comfort, and resilience.",
        "<b>Scoring Algorithm:</b> Weighted average formula across 8 sub-scores (Mobility, Transport, Accommodation, Venue, Restroom, Navigation, Sensory, Emergency).",
        "<b>Resilience Algorithm:</b> Single Point of Failure (SPOF) counter & graph redundancy metric.",
        "<b>SIH Demo State Machine:</b> 7-state deterministic runner (<i>INITIAL ➔ FAILED ➔ FIXING ➔ FIXED ➔ OUTAGE ➔ REROUTING ➔ RESTORED</i>)."
    ]
    for tk in tech_items:
        elements.append(Paragraph(f"• {tk}", bullet_style))

    elements.append(Spacer(1, 12))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=8, spaceAfter=8))
    elements.append(Paragraph("Generated automatically for Smart India Hackathon (SIH) — AccessChain Team", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#64748b'), alignment=1)))

    doc.build(elements)
    print(f"Successfully generated {filename}")

if __name__ == '__main__':
    build_pdf()
