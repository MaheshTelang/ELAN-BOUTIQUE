/* ÉLAN BOUTIQUE - client-side project functionality
   Uses localStorage for a single-browser college project demonstration. */
(function () {
  "use strict";
  const KEYS = {
    products: "elan_products_v1",
    gallery: "elan_gallery_v1",
    orders: "elan_orders_v1",
    messages: "elan_messages_v1",
    designs: "elan_design_requests_v1",
    wishlist: "elan_wishlist_v1"
  };
  const read = (key, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
    catch (_) { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const clean = value => String(value || "").trim();
  const money = value => "₹" + Number(value || 0).toLocaleString("en-IN");
  const slug = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const notify = (form, message) => {
    let note = form.querySelector(".js-feedback");
    if (!note) {
      note = document.createElement("p");
      note.className = "js-feedback";
      note.style.cssText = "margin-top:14px;color:#287348;font-weight:700;font-size:14px;";
      form.appendChild(note);
    }
    note.textContent = message;
  };
  const categoryClass = c => {
    const s = clean(c).toLowerCase();
    return s.startsWith("leh") ? "lehenga" : s.startsWith("gown") ? "gown" : s.startsWith("kur") ? "kurti" : "saree";
  };
  const seedProducts = () => {
    const grid = document.querySelector(".product-grid");
    if (!grid) return [];
    return [...grid.querySelectorAll(".product-card")].map((card, i) => ({
      id: card.dataset.productId || "seed-" + i,
      name: clean(card.querySelector("h2")?.textContent),
      category: clean(card.querySelector(".category")?.textContent),
      price: Number((card.querySelector(".price")?.textContent || "").replace(/[^\d.]/g, "")) || 0,
      description: clean(card.querySelector(".card-body p")?.textContent),
      image: card.querySelector("img")?.getAttribute("src") || "",
      active: true
    })).filter(p => p.name);
  };
  function getProducts() {
    let products = read(KEYS.products, null);
    if (!Array.isArray(products) || !products.length) {
      products = seedProducts();
      if (!products.length) products = [
        {id:"seed-saree",name:"Royal Silk Saree",category:"Sarees",price:4999,stock:12,image:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",description:"Rich traditional silk styling with an elegant gold border.",active:true},
        {id:"seed-lehenga",name:"Royal Bridal Lehenga",category:"Lehengas",price:12999,stock:6,image:"https://images.pexels.com/photos/38876958/pexels-photo-38876958.jpeg?auto=compress&cs=tinysrgb&w=900",description:"Embellished bridal wear for weddings and grand celebrations.",active:true},
        {id:"seed-gown",name:"Elegant Evening Gown",category:"Gowns",price:7499,stock:8,image:"https://images.pexels.com/photos/39873874/pexels-photo-39873874.jpeg?auto=compress&cs=tinysrgb&w=900",description:"A glamorous gown for special occasions.",active:true},
        {id:"seed-kurti",name:"White Chikankari Kurti",category:"Kurtis",price:2499,stock:25,image:"https://images.pexels.com/photos/28512776/pexels-photo-28512776.jpeg?auto=compress&cs=tinysrgb&w=900",description:"Graceful white embroidered traditional wear.",active:true},
        {id:"seed-ruby",name:"Ruby Heritage Saree",category:"Sarees",price:5499,stock:10,image:"https://images.pexels.com/photos/29467387/pexels-photo-29467387.jpeg?auto=compress&cs=tinysrgb&w=900",description:"Classic red-and-white traditional styling.",active:true},
        {id:"seed-festive",name:"Embroidered Festive Lehenga",category:"Lehengas",price:10999,stock:7,image:"https://images.pexels.com/photos/13162240/pexels-photo-13162240.jpeg?auto=compress&cs=tinysrgb&w=900",description:"Detailed traditional embroidery for celebrations.",active:true},
        {id:"seed-sparkle",name:"Sparkle Evening Gown",category:"Gowns",price:8499,stock:9,image:"https://images.pexels.com/photos/34362955/pexels-photo-34362955.jpeg?auto=compress&cs=tinysrgb&w=900",description:"Elegant occasion wear.",active:true},
        {id:"seed-pistachio",name:"Pistachio Chikankari Kurti",category:"Kurtis",price:2799,stock:15,image:"https://images.pexels.com/photos/28512787/pexels-photo-28512787.jpeg?auto=compress&cs=tinysrgb&w=900",description:"Soft green traditional embroidery.",active:true}
      ];
      write(KEYS.products, products);
    }
    return products || [];
  }
  function renderCollections() {
    const grid = document.querySelector(".product-grid");
    if (!grid) return;
    const products = getProducts().filter(p => p.active !== false);
    const oldCards = [...grid.querySelectorAll(".product-card")];
    // Keep the original design and update existing matching cards.
    products.forEach((p, index) => {
      let card = oldCards.find(c => clean(c.querySelector("h2")?.textContent).toLowerCase() === clean(p.name).toLowerCase());
      if (card) {
        const img = card.querySelector("img");
        const title = card.querySelector("h2");
        const cat = card.querySelector(".category");
        const desc = card.querySelector(".card-body p");
        const price = card.querySelector(".price");
        if (img && p.image) { img.src = p.image; img.alt = p.name; }
        if (title) title.textContent = p.name;
        if (cat) cat.textContent = p.category;
        if (desc) desc.textContent = p.description || "";
        if (price) price.textContent = money(p.price);
        card.className = "product-card " + categoryClass(p.category);
        card.dataset.productId = p.id;
      } else {
        const cardEl = document.createElement("article");
        cardEl.className = "product-card " + categoryClass(p.category);
        cardEl.dataset.productId = p.id;
        const heartId = "heart-" + slug(p.id);
        cardEl.innerHTML = `<div class="product-image"><img alt=""><input class="heart-check" type="checkbox"><label class="heart-toggle" aria-label="Add to favourites"><span>♡</span></label></div><div class="card-body"><div class="category"></div><h2></h2><p></p><div class="card-bottom"><span class="price"></span><a class="details-link" aria-label="View product details">→</a></div></div>`;
        cardEl.querySelector("img").src = p.image || "";
        cardEl.querySelector("img").alt = p.name;
        const check = cardEl.querySelector(".heart-check");
        check.id = heartId;
        const label = cardEl.querySelector(".heart-toggle");
        label.htmlFor = heartId;
        label.setAttribute("aria-label", "Add " + p.name + " to favourites");
        cardEl.querySelector(".category").textContent = p.category;
        cardEl.querySelector("h2").textContent = p.name;
        cardEl.querySelector(".card-body p").textContent = p.description || "";
        cardEl.querySelector(".price").textContent = money(p.price);
        cardEl.querySelector(".details-link").href = "product-details.html?product=" + encodeURIComponent(p.id);
        grid.appendChild(cardEl);
      }
    });
    // Remove deleted products from the rendered grid.
    oldCards.forEach(c => {
      const name = clean(c.querySelector("h2")?.textContent);
      if (!products.some(p => clean(p.name).toLowerCase() === name.toLowerCase())) c.remove();
    });
    applyWishlist();
  }
  function applyWishlist() {
    const wishlist = read(KEYS.wishlist, []);
    document.querySelectorAll(".product-card").forEach(card => {
      const name = clean(card.querySelector("h2")?.textContent);
      const input = card.querySelector(".heart-check");
      const label = card.querySelector(".heart-toggle");
      if (!input || !label) return;
      const active = wishlist.includes(name);
      input.checked = active;
      label.querySelector("span").textContent = active ? "♥" : "♡";
      label.style.color = active ? "#762f4f" : "";
    });
  }
  document.addEventListener("change", e => {
    if (e.target.matches(".heart-check")) {
      const card = e.target.closest(".product-card");
      const name = clean(card?.querySelector("h2")?.textContent);
      let list = read(KEYS.wishlist, []);
      list = e.target.checked ? [...new Set([...list, name])] : list.filter(x => x !== name);
      write(KEYS.wishlist, list);
      applyWishlist();
    }
  });

  function productsAdmin() {
    if (!location.pathname.endsWith("manage-products.html")) return;
    const products = getProducts();
    const addForm = document.querySelector("#add-product form");
    if (addForm) addForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = clean(addForm.querySelector("#new-name")?.value);
      const category = clean(addForm.querySelector("#new-category")?.value);
      const price = Number(addForm.querySelector("#new-price")?.value);
      const stock = Number(addForm.querySelector("#new-stock")?.value);
      const image = clean(addForm.querySelector("#new-image")?.value);
      const description = clean(addForm.querySelector("#new-description")?.value);
      if (!name || !category || !price || !image) { notify(addForm, "Please enter product name, category, price and image URL."); return; }
      const all = getProducts();
      all.push({id:"product-"+Date.now(),name,category,price,stock,image,description,active:true});
      write(KEYS.products, all);
      addForm.reset();
      notify(addForm, "Product saved! It will appear in Collections after refresh.");
      updateProductTable();
    });
    document.querySelectorAll(".product-edit-section .admin-form-panel form").forEach(form => {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const section = form.closest(".admin-form-panel");
        const id = section?.id || "";
        const names = {"edit-saree":"Royal Silk Saree","edit-lehenga":"Royal Bridal Lehenga","edit-gown":"Elegant Evening Gown","edit-kurti":"White Chikankari Kurti"};
        const original = names[id];
        const inputs = [...form.querySelectorAll("input,select")];
        if (inputs.length < 4) return;
        const [nameEl,catEl,priceEl,stockEl] = inputs;
        const all = getProducts();
        let p = all.find(x => x.name === original);
        if (!p) p = all.find(x => x.name === section.querySelector("h2")?.textContent.replace(/^Edit /,"").replace(/ Image$/,""));
        if (p) Object.assign(p,{name:clean(nameEl.value),category:clean(catEl.value),price:Number(priceEl.value),stock:Number(stockEl.value)});
        write(KEYS.products,all);
        notify(form,"Product updated successfully! Refresh Collections to see the changes.");
        updateProductTable();
      });
    });
  }
  function updateProductTable() {
    const tbody = document.querySelector(".product-admin-content tbody");
    if (!tbody) return;
    const products = getProducts();
    tbody.innerHTML = products.map(p => `<tr><td><div class="product-table-name"><img class="product-image-preview" src="${escapeAttr(p.image)}" alt=""><strong>${escapeHtml(p.name)}</strong></div></td><td>${escapeHtml(p.category)}</td><td>${money(p.price)}</td><td>${Number(p.stock||0)}</td><td><span class="status delivered">Active</span></td><td><span class="table-action">Saved</span></td></tr>`).join("");
  }
  const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const escapeAttr = escapeHtml;

  function galleryAdmin() {
    if (!location.pathname.endsWith("manage-gallery.html")) return;
    const addForm = document.querySelector("#add-image form");
    if (addForm) addForm.addEventListener("submit",e=>{
      e.preventDefault();
      const inputs=addForm.querySelectorAll("input,select,textarea");
      const [title,category,url,desc]=inputs;
      if(!clean(title.value)||!clean(category.value)||!clean(url.value)){notify(addForm,"Please complete the title, category and image URL.");return;}
      const items=read(KEYS.gallery,[]);
      items.push({id:"gallery-"+Date.now(),title:clean(title.value),category:clean(category.value),url:clean(url.value),description:clean(desc.value)});
      write(KEYS.gallery,items);
      addForm.reset();
      notify(addForm,"Image saved in gallery data. Refresh the customer Gallery page to view it.");
    });
    document.querySelectorAll(".gallery-edit-list form").forEach((form,i)=>form.addEventListener("submit",e=>{
      e.preventDefault();
      const inputs=form.querySelectorAll("input,select");
      const [title,category,url]=inputs;
      const items=read(KEYS.gallery,[]);
      items[i]={id:items[i]?.id||"seed-gallery-"+i,title:clean(title.value),category:clean(category.value),url:clean(url.value),description:""};
      write(KEYS.gallery,items);
      const card=document.querySelectorAll(".gallery-admin-card")[i];
      if(card){const image=card.querySelector("img");const heading=card.querySelector("h3");const caption=card.querySelector("p");if(image)image.src=clean(url.value);if(heading)heading.textContent=clean(title.value);if(caption)caption.textContent="Category: "+clean(category.value);}
      notify(form,"Gallery image details saved.");
    }));
  }
  function renderExtraGallery() {
    if(!location.pathname.endsWith("gallery.html")) return;
    const gallery = read(KEYS.gallery,[]);
    const container = document.querySelector(".gallery-grid, .gallery-page .gallery-grid, .gallery-content");
    if(!container) return;
    gallery.forEach(item=>{
      const card=document.createElement("a");
      card.className="gallery-item";
      card.href="contact.html";
      card.innerHTML=`<img src="${escapeAttr(item.url)}" alt="${escapeAttr(item.title)}"><div class="gallery-overlay"><span>${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3></div>`;
      container.appendChild(card);
    });
  }
  function orderAdmin() {
    if(!location.pathname.endsWith("manage-orders.html")) return;
    document.querySelectorAll(".order-details").forEach(section=>{
      const id=section.id.replace("order-","");
      const btn=section.querySelector(".order-update button");
      const select=section.querySelector(".order-update select");
      if(!btn||!select)return;
      const saved=read(KEYS.orders,{});
      if(saved[id]) select.value=saved[id];
      btn.addEventListener("click",()=>{
        const all=read(KEYS.orders,{});
        all[id]=select.value;
        write(KEYS.orders,all);
        const current=section.querySelector("dl dd:last-child");
        if(current) current.textContent=select.value;
        notify(section, "Order status saved as "+select.value+".");
      });
    });
  }
  function login() {
    if(!location.pathname.endsWith("admin-login.html"))return;
    const form=document.querySelector("form");
    if(!form)return;
    const submitLink=form.querySelector('a[href="admin-dashboard.html"]');
    if(submitLink) submitLink.remove();
    const btn=document.createElement("button");
    btn.type="submit"; btn.className="primary-btn admin-login-btn"; btn.textContent="Sign In →";
    form.appendChild(btn);
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const fields=form.querySelectorAll('input[type="email"],input[type="password"]');
      if(fields[0]?.value==="admin" && fields[1]?.value==="elan123" || fields[0]?.value==="admin@elanboutique.com" && fields[1]?.value==="elan123"){
        sessionStorage.setItem("elan_admin_logged_in","yes");
        location.href="admin-dashboard.html";
      }else notify(form,"Invalid login. Demo credentials: admin@elanboutique.com / elan123");
    });
  }
  function forms() {
    if(location.pathname.endsWith("contact.html")){
      const form=document.querySelector(".contact-form-card form");
      if(form) form.addEventListener("submit",e=>{
        e.preventDefault();
        const inputs=form.querySelectorAll("input,textarea");
        const [name,email,subject,message]=inputs;
        if(!clean(name.value)||!clean(email.value)||!clean(subject.value)||!clean(message.value)){notify(form,"Please complete all fields.");return;}
        const list=read(KEYS.messages,[]);
        list.unshift({id:Date.now(),name:clean(name.value),email:clean(email.value),subject:clean(subject.value),message:clean(message.value),date:new Date().toLocaleString()});
        write(KEYS.messages,list); form.reset(); notify(form,"Thank you! Your message has been saved.");
      });
    }
    if(location.pathname.endsWith("custom-design.html")){
      const form=document.querySelector(".design-form");
      if(form) form.addEventListener("submit",e=>{
        e.preventDefault();
        const vals=[...form.querySelectorAll("input,select,textarea")].map(x=>clean(x.value));
        if(vals.some(x=>!x)){notify(form,"Please complete all design request fields.");return;}
        const list=read(KEYS.designs,[]);
        list.unshift({id:Date.now(),values:vals,date:new Date().toLocaleString()});
        write(KEYS.designs,list);form.reset();notify(form,"Your design request has been saved. Thank you!");
      });
    }
  }
  function renderMessages() {
    if(!location.pathname.endsWith("manage-messages.html"))return;
    const list=read(KEYS.messages,[]);
    if(!list.length)return;
    const section=document.querySelector(".message-list");
    if(!section)return;
    list.forEach(m=>{
      const card=document.createElement("article");card.className="message-card unread";
      card.innerHTML=`<div class="message-avatar">${escapeHtml(m.name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase())}</div><div class="message-content"><div class="message-top"><strong>${escapeHtml(m.name)}</strong><span>${escapeHtml(m.date)}</span></div><h3>${escapeHtml(m.subject)}</h3><p>${escapeHtml(m.message.slice(0,100))}</p></div><div class="message-actions"><a class="message-action" href="mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent("Re: "+m.subject)}">Reply</a></div>`;
      section.prepend(card);
    });
  }
  function dashboard() {
    if(!location.pathname.endsWith("admin-dashboard.html"))return;
    const products=getProducts(), orders=read(KEYS.orders,{});
    const count=document.querySelectorAll(".stat-card h2, .stat-card h3, .stat-number");
    if(count[0])count[0].textContent=products.length;
    const messages=read(KEYS.messages,[]);
    if(count[3])count[3].textContent=messages.length;
  }
  document.addEventListener("DOMContentLoaded",()=>{
    renderCollections(); productsAdmin(); galleryAdmin(); renderExtraGallery();
    orderAdmin(); login(); forms(); renderMessages(); dashboard();
  });
})();