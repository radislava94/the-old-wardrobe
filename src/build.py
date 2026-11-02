import base64,re,os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
items=[
 ("poncho","Crochet Fringe Poncho","Hand-knit · 1970s","OS",38,"-1.5deg",False),
 ("trench","Camel Wool Trench Coat","Belted · 1980s","M",64,"1deg",False),
 ("floral-dress","Red Floral Tea Dress","Cotton · 1950s style","S",42,"-.8deg",True),
 ("leather","Black Leather Biker","Real leather · 90s","L",89,"1.4deg",False),
 ("denim","Levi's 501 Trio Bundle","Denim · W30 L32","W30",55,"-1deg",False),
 ("bomber","Rust Satin Bomber","Lightweight · 1990s","M",36,".8deg",False),
 ("maxi-dress","Scarlet Swing Maxi","Chiffon · 1970s","XS",48,"-1.2deg",False),
 ("beanie","Autumn Knit Bundle","Beanie + cardigan","S/M",29,"1.2deg",False),
]
heart='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a2423a" stroke-width="2"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>'
cards=[]
for img,name,era,size,price,rot,sold in items:
    stamp='<div class="stamp">SOLD<small>· WITH LOVE ·</small></div>' if sold else ''
    cards.append(f'''<article class="card{' sold' if sold else ''}" style="--r:{rot}">
        <span class="size">SIZE {size}</span><span class="heart">{heart}</span>
        <div class="ph"><img src="img/{img}.jpg" alt="{name}">{stamp}</div>
        <div class="meta"><div><h3>{name}</h3><div class="era">{era}</div></div><span class="price">€{price}</span></div>
      </article>''')
html=open(f'{root}/src/template.html').read().replace('__CARDS__','\n      '.join(cards))
def inline(m):
    p=f'{root}/mockup/{m.group(1)}'
    return 'src="data:image/jpeg;base64,'+base64.b64encode(open(p,'rb').read()).decode()+'"'
html=re.sub(r'src="(img/[^"]+)"',inline,html)
open(f'{root}/mockup/index.html','w').write(html)
print(os.path.getsize(f'{root}/mockup/index.html'))
