# Parametrik Veri Servisi (PDAAS)

> ⚠️ **ÖNEMLİ UYARI:** Bu platformdaki veriler **bilgilendirme amaçlıdır**. Resmi işlemlerde kullanmadan önce ilgili kurumun **güncel mevzuatına** ve **resmi yayınlarına** başvurmanız gerekir. Detaylar için [YASAL_UYARI.md](YASAL_UYARI.md) dosyasına bakın.

Kamu kurumlarının **ürün, hizmet ve genel parametrelerini** tek çatı altında sunan açık veri ekosistemi.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Kamu%20Malı-green)
![Status](https://img.shields.io/badge/status-aktif-success)

---

## ⚠️ Yasal Uyarılar

### 📌 Verinin Niteliği

Bu platformda yayınlanan veriler:
- **Bilgilendirme ve referans amaçlıdır**
- **Resmi belge yerine geçmez**
- **Hukuki bağlayıcılığı yoktur**
- **Nihai karar verme aracı değildir**

### 📌 Resmi Kaynak Önceliği

Herhangi bir işlem yapmadan önce **mutlaka** şu resmi kaynaklara başvurun:

| Veri Türü | Resmi Kaynak |
|---|---|
| GTİP kodları | T.C. Resmi Gazete, Gümrükler Genel Müdürlüğü |
| Vergi oranları | GİB, Resmi Gazete |
| Asgari ücret | Asgari Ücret Tespit Komisyonu Kararları |
| Faiz oranları | TCMB Tebliğleri |
| Standartlar | TSE Resmi Yayınları |

### 📌 Güncellik ve Sürüm

- Veriler **belirli bir tarih itibarıyla** geçerlidir
- Her dosya kendi **sürüm ve güncelleme tarihini** taşır
- Mevzuat değişikliği **anında yansımayabilir**
- Kritik kararlar öncesi **son sürümü teyit edin**

### 📌 Sorumluluk Reddi

T.C. Ticaret Bakanlığı ve katkı sağlayan kurumlar:
- Verinin **doğruluğu, güncelliği, eksiksizliği** konusunda **garanti vermez**
- Verinin kullanımından doğan **doğrudan veya dolaylı zararlardan** sorumlu tutulamaz
- Veriye dayanarak alınan **kararların sonuçlarından** sorumlu değildir

### 📌 Fikri Mülkiyet

- Tüm veriler **kamu malıdır** (public domain)
- Ticari kullanım dahil **her türlü kullanım serbesttir**
- Kaynak gösterme **zorunlu değildir** (tavsiye edilir)

**Tam metin:** [YASAL_UYARI.md](YASAL_UYARI.md)

---

## 🎯 Nedir?

PDAAS, GTİP kodlu ürünler, hizmet kodlu işler ve genel yasal/ekonomik parametreler için **tek merkezden, programcı dostu, versiyonlanabilir** veri sunar.

**Temel felsefe:**
- ✅ **Tek doğruluk kaynağı** — Her veri tek yerde tanımlanır
- ✅ **Kurum bazlı sahiplik** — Her bakanlık kendi verisinden sorumlu
- ✅ **Otomatik türetme** — Master değişince küçük parametre dosyaları üretilir
- ✅ **Versiyonlanabilir** — Her dosya kendi sürümünü taşır
- ✅ **Programcı dostu** — JSON, REST API, CI/CD

---

## 🏛️ Üç Katmanlı Mimari
