import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_report():
    pdf_filename = "kristallball_submission_report.pdf"
    
    # Page setup - Standard letter size
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles matching Kristallball dark/amber theme accents
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#1e293b'), # Dark Slate
        alignment=1, # Centered
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=14,
        textColor=colors.HexColor('#d97706'), # Amber
        alignment=1, # Centered
        spaceAfter=40
    )
    
    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )
    
    bullet_style = ParagraphStyle(
        'ReportBullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=5
    )
    
    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#0f172a'),
        backColor=colors.HexColor('#f1f5f9'),
        borderColor=colors.HexColor('#cbd5e1'),
        borderWidth=0.5,
        borderPadding=5,
        spaceAfter=8
    )

    table_header_style = ParagraphStyle(
        'TableHeaderText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        'TableCellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#334155')
    )

    table_cell_code_style = ParagraphStyle(
        'TableCellCodeText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=10,
        textColor=colors.HexColor('#020617')
    )

    story = []
    
    # ------------------ COVER PAGE / HEADER ------------------
    story.append(Spacer(1, 40))
    story.append(Paragraph("KRISTALLBALL", title_style))
    story.append(Paragraph("MILITARY ASSET MANAGEMENT SYSTEM (MAMS)", subtitle_style))
    
    # Divider Line
    line_data = [['']]
    line_table = Table(line_data, colWidths=[530], rowHeights=[2])
    line_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1e293b')),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 20))
    
    # ------------------ SECTION 1: PROJECT OVERVIEW ------------------
    story.append(Paragraph("1. Project Overview", h1_style))
    story.append(Paragraph("Kristallball is an enterprise-grade Military Asset Management System (MAMS) designed to track critical weapons, vehicles, and ammunition stocks across multiple bases in real-time. By providing comprehensive transaction ledgers, the platform resolves typical coordination delays and prevents inventory sync bugs.", body_style))
    
    story.append(Paragraph("<b>Core Objectives:</b>", h2_style))
    story.append(Paragraph("• <b>Double-Entry Traceability:</b> All stocks are tracked dynamically via transactional ledgers, guaranteeing math consistency at any point in time.", bullet_style))
    story.append(Paragraph("• <b>Operational Accountability:</b> Standardizing base transfers, procurements, and checkouts with secure authorizations.", bullet_style))
    story.append(Paragraph("• <b>Strict Audit Trails:</b> Logging every asset mutation to ensure strict operational audits.", bullet_style))
    
    story.append(Paragraph("<b>Key Assumptions:</b>", h2_style))
    story.append(Paragraph("• SQLite is used for zero-setup local execution, while Prisma allows a clean swap to PostgreSQL in production.", bullet_style))
    story.append(Paragraph("• Stock balances cannot go negative. Any transaction that exceeds available stock is rolled back immediately.", bullet_style))
    
    story.append(Paragraph("<b>System Limitations:</b>", h2_style))
    story.append(Paragraph("• In the current framework, transfers execute immediately as 'COMPLETED'. A production-level system would introduce distinct 'PENDING' and 'IN_TRANSIT' shipping phases requiring physical confirmation by the receiving commander.", bullet_style))
    
    story.append(Spacer(1, 10))
    
    # ------------------ SECTION 2: TECH STACK & ARCHITECTURE ------------------
    story.append(Paragraph("2. Tech Stack & Architecture", h1_style))
    story.append(Paragraph("The system is designed with a decoupled client-server architecture:", body_style))
    story.append(Paragraph("• <b>Frontend (React + Vite + Tailwind CSS v4):</b> Scaffolded with Vite for instant loading. Tailwind v4 handles modern CSS-first styling, featuring slate-colored glassmorphism and tactical amber outlines. Lucide React provides modern vector icons, and Recharts renders responsive asset distributions.", bullet_style))
    story.append(Paragraph("• <b>Backend (Node.js + Express.js):</b> Configured with Express ES6 module syntax, CORS for client browser support, and Helmet for setting security-related HTTP headers.", bullet_style))
    story.append(Paragraph("• <b>ORM & Database (Prisma + SQLite):</b> SQLite serves as a serverless local database. Prisma ORM handles migration tracking, database connections, and guarantees ACID safety during multi-row transfers via database transactions.", bullet_style))
    
    story.append(Spacer(1, 10))
    
    # ------------------ SECTION 3: DATA MODELS / SCHEMA ------------------
    story.append(Paragraph("3. Data Models / Schema", h1_style))
    story.append(Paragraph("The system uses relational constraints in SQLite to ensure transactional integrity. The core tables are defined as follows:", body_style))
    
    schema_details = (
        "• <b>Base:</b> Represents military locations (e.g. Fort Alpha). Holds name and location coordinates.<br/>"
        "• <b>User:</b> Operator accounts holding username, passwordHash (Bcrypt), role, and an optional baseId.<br/>"
        "• <b>EquipmentType:</b> Stock categories (category enum: WEAPON, VEHICLE, AMMUNITION) and model names.<br/>"
        "• <b>Asset:</b> Snapshot table storing the current stock quantity for each Base and EquipmentType.<br/>"
        "• <b>Purchase:</b> Ledger recording incoming stock procurements.<br/>"
        "• <b>Transfer:</b> Ledger tracking base-to-base reallocations, initiated by a specific operator.<br/>"
        "• <b>Assignment:</b> Records of equipment checked out to soldiers, tracking active or returned status.<br/>"
        "• <b>Expenditure:</b> Records of expended assets (e.g. ammunition spent, vehicles decommissioned).<br/>"
        "• <b>AuditLog:</b> Central log capturing operator logins and successful asset mutations."
    )
    story.append(Paragraph(schema_details, body_style))
    story.append(Spacer(1, 10))
    
    # ------------------ SECTION 4: ROLE-BASED ACCESS CONTROL (RBAC) ------------------
    story.append(PageBreak()) # Shift to next page for clean structure
    story.append(Paragraph("4. Role-Based Access Control (RBAC)", h1_style))
    story.append(Paragraph("Granular permissions are enforced on the backend via Express middlewares:", body_style))
    story.append(Paragraph("• <b>authorizeRoles(...allowedRoles):</b> Protects API routes by verifying the operator's JWT claims. For instance, creating purchases is restricted solely to Admin and Logistics Officers.", bullet_style))
    story.append(Paragraph("• <b>enforceBaseScope:</b> For Base Commanders, this interceptor automatically forces the baseId query parameter to their assigned baseId, preventing them from fetching other bases' metrics, and rejects payloads attempting to checkout or transfer out of another base.", bullet_style))
    
    story.append(Spacer(1, 5))
    story.append(Paragraph("<b>RBAC Authorization Matrix:</b>", h2_style))
    
    # Matrix Table
    matrix_data = [
      [Paragraph("Operation / Endpoints", table_header_style), Paragraph("Admin", table_header_style), Paragraph("Base Commander", table_header_style), Paragraph("Logistics Officer", table_header_style)],
      [Paragraph("View Dashboard Metrics", table_cell_style), Paragraph("Global (All Bases)", table_cell_style), Paragraph("Scoped (Own Base)", table_cell_style), Paragraph("Global (All Bases)", table_cell_style)],
      [Paragraph("Procure Stock (Purchases)", table_cell_style), Paragraph("Write / View", table_cell_style), Paragraph("View Only (Scoped)", table_cell_style), Paragraph("Write / View", table_cell_style)],
      [Paragraph("Base Transfers", table_cell_style), Paragraph("Write / View Global", table_cell_style), Paragraph("Write / View (Own Base Outflow)", table_cell_style), Paragraph("Write / View Global", table_cell_style)],
      [Paragraph("Personnel Checkouts", table_cell_style), Paragraph("Write / View Global", table_cell_style), Paragraph("Write / View (Scoped)", table_cell_style), Paragraph("Write / View Global", table_cell_style)],
      [Paragraph("View Audit Logs", table_cell_style), Paragraph("Full Access", table_cell_style), Paragraph("View (Scoped)", table_cell_style), Paragraph("Full Access", table_cell_style)]
    ]
    
    matrix_table = Table(matrix_data, colWidths=[170, 120, 120, 120])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(matrix_table)
    story.append(Spacer(1, 15))
    
    # ------------------ SECTION 5: API LOGGING ------------------
    story.append(Paragraph("5. API Logging (Audit Trail)", h1_style))
    story.append(Paragraph("To ensure operational accountability, the system intercepts all mutations. We implement this using an automated middleware: <code>auditLogger</code> in <code>loggerMiddleware.js</code>.", body_style))
    story.append(Paragraph("This middleware overrides the Express response <code>send</code> method. Once the response successfully finishes with a 2xx HTTP status, it checks if the request method was POST, PUT, or DELETE. If so, it compiles details (e.g. quantity, base names, operator ID) and writes a new row to the <code>AuditLog</code> table. operator logins are also logged upon successful token issue.", body_style))
    
    story.append(Spacer(1, 10))
    
    # ------------------ SECTION 6: SETUP INSTRUCTIONS ------------------
    story.append(Paragraph("6. Setup Instructions", h1_style))
    story.append(Paragraph("<b>1. Backend Setup:</b>", h2_style))
    story.append(Paragraph("<code>cd backend</code><br/>"
                           "<code>npm install</code><br/>"
                           "<code>npx prisma generate</code><br/>"
                           "<code>npx prisma migrate dev --name init</code><br/>"
                           "<code>node prisma/seed.js</code><br/>"
                           "<code>npm run dev</code>", code_style))
                           
    story.append(Paragraph("<b>2. Frontend Setup:</b>", h2_style))
    story.append(Paragraph("<code>cd frontend</code><br/>"
                           "<code>npm install</code><br/>"
                           "<code>npm run dev</code>", code_style))
    
    story.append(Spacer(1, 10))
    
    # ------------------ SECTION 7: API ENDPOINTS ------------------
    story.append(PageBreak()) # Final page for API and logins
    story.append(Paragraph("7. Key API Endpoints", h1_style))
    
    api_data = [
      [Paragraph("Endpoint", table_header_style), Paragraph("Method", table_header_style), Paragraph("Description", table_header_style), Paragraph("Access Roles", table_header_style)],
      [Paragraph("/auth/login", table_cell_code_style), Paragraph("POST", table_cell_style), Paragraph("Authenticate user, return signed JWT", table_cell_style), Paragraph("Public", table_cell_style)],
      [Paragraph("/assets/dashboard-metrics", table_cell_code_style), Paragraph("GET", table_cell_style), Paragraph("Calculate opening, movements, active stock", table_cell_style), Paragraph("All (Scoped for Commander)", table_cell_style)],
      [Paragraph("/assets/status", table_cell_code_style), Paragraph("GET", table_cell_style), Paragraph("Fetch current base stock snapshot levels", table_cell_style), Paragraph("All (Scoped for Commander)", table_cell_style)],
      [Paragraph("/purchases", table_cell_code_style), Paragraph("POST", table_cell_style), Paragraph("Atomically procure new stocks for a base", table_cell_style), Paragraph("Admin, Logistics Officer", table_cell_style)],
      [Paragraph("/transfers", table_cell_code_style), Paragraph("POST", table_cell_style), Paragraph("Dispatches stock base-to-base atomically", table_cell_style), Paragraph("Admin, Logistics, Commander (scoped)", table_cell_style)],
      [Paragraph("/assignments", table_cell_code_style), Paragraph("POST", table_cell_style), Paragraph("Assigns/Checkouts equipment to personnel", table_cell_style), Paragraph("Admin, Logistics, Commander", table_cell_style)],
      [Paragraph("/assignments/:id/return", table_cell_code_style), Paragraph("POST", table_cell_style), Paragraph("Registers return of checked out equipment", table_cell_style), Paragraph("Admin, Logistics, Commander", table_cell_style)],
      [Paragraph("/expenditures", table_cell_code_style), Paragraph("POST", table_cell_style), Paragraph("Log consumed resources (e.g. spent ammo)", table_cell_style), Paragraph("Admin, Logistics, Commander", table_cell_style)],
      [Paragraph("/assets/audit-logs", table_cell_code_style), Paragraph("GET", table_cell_style), Paragraph("Review secure terminal audit ledger logs", table_cell_style), Paragraph("All (Scoped for Commander)", table_cell_style)]
    ]
    
    api_table = Table(api_data, colWidths=[150, 60, 180, 140])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 15))
    
    # ------------------ SECTION 8: LOGIN CREDENTIALS ------------------
    story.append(Paragraph("8. Platform Login Credentials", h1_style))
    story.append(Paragraph("The database contains pre-configured credentials representing each organizational role:", body_style))
    
    cred_data = [
      [Paragraph("Role", table_header_style), Paragraph("Username", table_header_style), Paragraph("Clear Password", table_header_style), Paragraph("Assigned base Scope", table_header_style)],
      [Paragraph("Global Admin", table_cell_style), Paragraph("admin_user", table_cell_code_style), Paragraph("AdminPass123!", table_cell_code_style), Paragraph("Global / Unrestricted", table_cell_style)],
      [Paragraph("Base Commander", table_cell_style), Paragraph("commander_alpha", table_cell_code_style), Paragraph("CommandPass123!", table_cell_code_style), Paragraph("Fort Alpha (Base #1)", table_cell_style)],
      [Paragraph("Base Commander", table_cell_style), Paragraph("commander_bravo", table_cell_code_style), Paragraph("CommandPass123!", table_cell_code_style), Paragraph("Fort Bravo (Base #2)", table_cell_style)],
      [Paragraph("Logistics Officer", table_cell_style), Paragraph("logistics_officer", table_cell_code_style), Paragraph("LogisticsPass123!", table_cell_code_style), Paragraph("Global / Logistics Scope", table_cell_style)]
    ]
    
    cred_table = Table(cred_data, colWidths=[120, 125, 125, 160])
    cred_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(cred_table)
    
    # Build Document
    doc.build(story)
    print("Report PDF generated successfully.")

if __name__ == "__main__":
    create_report()
