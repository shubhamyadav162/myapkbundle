
> दोनों Functions पहले से `payment_gateway_credentials` से रियल API-keys पढ़ते हैं और `callbackUrl` को हैंडल करते हैं।

---

## 3. GitHub Repository Setup  
1. GitHub पर नया Repo बनाएँ (या मौजूदा प्रयोग करें)  
2. `.gitignore` में `node_modules/` और `.env` शामिल करें  
3. रूट में Git इनिशियलाइज़ करें:
    ```bash
    git init
    git remote add origin https://github.com/आपका-यूजर/आपका-रिपो.git
    git add supabase/functions supabase/migrations
    git commit -m "feat: add Lightspeed migration & payment functions"
    git push -u origin main
    ```

---

## 4. Supabase GitHub Integration  
1. Supabase Dashboard → आपका प्रोजेक्ट → **Functions** टैब  
2. **GitHub** सेक्शन में “Connect repo”  
3. GitHub अकाउंट ऑथराइज़ → Repo & Branch (`main`) चुने  
4. Root Directory: `supabase/functions`  
5. (अगर उपलब्ध) Migrations Directory: `supabase/migrations`  
6. “Save” दबाएं → Supabase auto-build & deploy शुरू कर देगा  

---

## 5. Verify & Test  
- Supabase Dashboard → **Functions** → दोनों फ़ंक्शंस “Deployed” दिखें  
- Supabase Dashboard → **Database → Migrations** → आपकी migration रन हो चुकी हो  
- ऐप से टेस्ट करें:
  1. `initialize-payment` कॉल → real Lightspeed URL प्राप्त  
  2. पेमेंट के बाद callback/deep-link या webhook से कन्फ़र्मेशन  

---

## 6. Ongoing Workflow  
- कोड चेंज (फ़ंक्शंस या माईग्रेशन) → GitHub में commit & push  
- Supabase GitHub Integration auto deploy करेगी  

---

### हिंदी सारांश  
1. `supabase/migrations` में Lightspeed credentials migration लिखें  
2. `supabase/functions` में पेमेंट सेशन Edge Functions रखें  
3. GitHub पे पुश करें  
4. Supabase Dashboard में GitHub Integration सेटअप करें  
5. हर पुश पर ऑटोमेटिक बिल्ड & डिप्लॉय होगा  