import docx

doc = docx.Document('d:/DermaNova/reports/Paper_Template.docx')
print('Sections count:', len(doc.sections))
for i, s in enumerate(doc.sections):
    print(f'Section {i}: top={s.top_margin.inches}, bottom={s.bottom_margin.inches}, left={s.left_margin.inches}, right={s.right_margin.inches}')

for i, p in enumerate(doc.paragraphs[:15]):
    if p.text.strip():
        runs_info = []
        for r in p.runs:
            color = str(r.font.color.rgb) if (r.font.color and r.font.color.rgb) else None
            size = r.font.size.pt if r.font.size else None
            runs_info.append((r.text, r.font.name, size, r.font.bold, r.font.italic, color))
        print(f'P[{i}]: text="{p.text[:50]}" style={p.style.name} runs={runs_info}')
