#!/usr/bin/env node
/**
 * TC-PVS Parametrik Türetme Motoru
 * ---------------------------------
 * Girdi : /gtip/fasil/*.json  (MASTER — kurumlar buraya yazar)
 * Çıktı : /parametrik/*.json  (TÜREV — otomatik üretilir, salt okunur)
 *
 * Bu betik CI/CD tarafından tetiklenir.
 * Elle çalıştırmak için: node scripts/turet.js
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────
// AYARLAR
// ─────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const MASTER_DIR = path.join(ROOT, 'gtip', 'fasil');
const CIKTI_DIR = path.join(ROOT, 'parametrik');
const BUGUN = new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────
// YARDIMCILAR
// ─────────────────────────────────────────────────────────
function dosyaOku(yol) {
  return JSON.parse(fs.readFileSync(yol, 'utf8'));
}

function dosyaYaz(yol, veri) {
  fs.mkdirSync(path.dirname(yol), { recursive: true });
  fs.writeFileSync(yol, JSON.stringify(veri, null, 2) + '\n', 'utf8');
}

function masterDosyalariListele() {
  return fs
    .readdirSync(MASTER_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(MASTER_DIR, f));
}

function tumKayitlariTopla() {
  const tumKayitlar = [];
  masterDosyalariListele().forEach(dosya => {
    const master = dosyaOku(dosya);
    const fasilNo = master.meta?.fasil_no ?? 'bilinmiyor';
    master.kayitlar.forEach(k => {
      tumKayitlar.push({ ...k, _fasil_no: fasilNo });
    });
  });
  return tumKayitlar;
}

// ─────────────────────────────────────────────────────────
// TÜRETİCİLER — Her parametre için bir fonksiyon
// ─────────────────────────────────────────────────────────

// 1. KDV
function turetKdv(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.hazine_maliye?.kdv_orani !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      oran: k.kurumlar.hazine_maliye.kdv_orani
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Hazine ve Maliye Bakanlığı (GİB)",
    parametre: "kdv_orani",
    birim: "%",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 2. ÖTV
function turetOtv(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.hazine_maliye?.otv_orani !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      tutar: k.kurumlar.hazine_maliye.otv_orani,
      birim: k.kurumlar.hazine_maliye.otv_birimi ?? null,
      durum: k.kurumlar.hazine_maliye.otv_durumu ?? "belirsiz"
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Hazine ve Maliye Bakanlığı (GİB)",
    parametre: "otv_tutari",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 3. Tevkifat
function turetTevkifat(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.hazine_maliye?.tevkifat_kodu)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      kod: k.kurumlar.hazine_maliye.tevkifat_kodu,
      oran: k.kurumlar.hazine_maliye.tevkifat_orani
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Hazine ve Maliye Bakanlığı (GİB)",
    parametre: "tevkifat",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 4. NACE
function turetNace(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.hazine_maliye?.nace_kodu)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      nace_kodu: k.kurumlar.hazine_maliye.nace_kodu,
      vergi_levhasi_faaliyet_kodu: k.kurumlar.hazine_maliye.vergi_levhasi_faaliyet_kodu ?? k.kurumlar.hazine_maliye.nace_kodu
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Hazine ve Maliye Bakanlığı (GİB)",
    parametre: "nace_atama",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 5. Kalori
function turetKalori(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.enerji?.kalori_min_kcal_kg !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      kalori_min_kcal_kg: k.kurumlar.enerji.kalori_min_kcal_kg,
      standart: k.kurumlar.sanayi_teknoloji?.zorunlu_standart ?? null
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Enerji ve Tabii Kaynaklar Bakanlığı (MAPEG)",
    parametre: "kalori_min_kcal_kg",
    birim: "kcal/kg",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 6. Maden Ruhsatı
function turetMadenRuhsati(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.enerji?.maden_ruhsati_gerekli !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      gerekli: k.kurumlar.enerji.maden_ruhsati_gerekli,
      ruhsat_turu: k.kurumlar.enerji.ruhsat_turu ?? null,
      maden_grubu: k.kurumlar.enerji.maden_grubu ?? null
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Enerji ve Tabii Kaynaklar Bakanlığı (MAPEG)",
    parametre: "maden_ruhsati",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 7. Kükürt & Nem
function turetKukurtNem(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.cevre?.kukurt_max_yuzde !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      kukurt_max_yuzde: k.kurumlar.cevre.kukurt_max_yuzde,
      nem_max_yuzde: k.kurumlar.cevre.nem_max_yuzde ?? null
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı",
    parametre: "kukurt_nem",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 8. ÇED
function turetCed(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.cevre?.ced_gerekli !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      gerekli: k.kurumlar.cevre.ced_gerekli,
      ced_turu: k.kurumlar.cevre.ced_turu ?? null,
      esik_deger: k.kurumlar.cevre.ced_esik_deger ?? null
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı",
    parametre: "ced",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 9. TSE Standart
function turetTseStandart(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.sanayi_teknoloji?.zorunlu_standart)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      zorunlu_standart: k.kurumlar.sanayi_teknoloji.zorunlu_standart,
      standart_adi: k.kurumlar.sanayi_teknoloji.standart_adi ?? null,
      tse_belgesi_gerekli: k.kurumlar.sanayi_teknoloji.tse_belgesi_gerekli ?? false
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "Türk Standardları Enstitüsü (TSE)",
    parametre: "tse_standart",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 10. İthalat Rejimi
function turetIthalatRejimi(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.ticaret?.ithalat_rejimi)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      rejim: k.kurumlar.ticaret.ithalat_rejimi,
      gumruk_vergisi: k.kurumlar.ticaret.gumruk_vergisi ?? 0,
      gozetim: k.kurumlar.ticaret.gozetim_gerekli ?? false
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Ticaret Bakanlığı (İthalat Gen. Müd.)",
    parametre: "ithalat_rejimi",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 11. İhracat Rejimi
function turetIhracatRejimi(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.ticaret?.ihracat_rejimi)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      rejim: k.kurumlar.ticaret.ihracat_rejimi,
      ihracatci_birligi: k.kurumlar.ticaret.ihracatci_birligi ?? null
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Ticaret Bakanlığı (İhracat Gen. Müd.)",
    parametre: "ihracat_rejimi",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 12. Gözetim
function turetGozetim(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.ticaret?.gozetim_gerekli !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      gozetim_belgesi_gerekli: k.kurumlar.ticaret.gozetim_gerekli
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Ticaret Bakanlığı (İthalat Gen. Müd.)",
    parametre: "gozetim",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 13. Kota
function turetKota(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.ticaret?.kota_kapsaminda !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      kota_kapsaminda: k.kurumlar.ticaret.kota_kapsaminda
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Ticaret Bakanlığı (İthalat Gen. Müd.)",
    parametre: "kota",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 14. Randıman
function turetRandiman(kayitlar) {
  const iliskiler = [];
  kayitlar.forEach(k => {
    const r = k.kurumlar?.ticaret?.randiman_iliskileri || [];
    r.forEach(il => {
      // Yön varsa, girdi/çıktı sırası korunur
      const girdi = il.yon === 'girdi' ? k.gtip_ham : il.gtip_ham_karsi;
      const cikti = il.yon === 'cikti' ? k.gtip_ham : il.gtip_ham_karsi;
      iliskiler.push({
        gtip_ham_girdi: girdi,
        gtip_ham_cikti: cikti,
        islem_adi: il.islem_adi,
        asgari_randiman: il.asgari_randiman,
        azami_fire: il.azami_fire,
        ikincil_urunler: il.ikincil_urunler || [],
        toplam_oran_kontrolu: il.toplam_oran_kontrolu ?? null
      });
    });
  });
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Ticaret Bakanlığı + İMMİB/TOBB",
    parametre: "randiman_iliskileri",
    join_anahtari: ["gtip_ham_girdi", "gtip_ham_cikti"],
    otomatik_uretim: true,
    toplam_kayit: iliskiler.length,
    kayitlar: iliskiler
  };
}

// 15. Ürün Güvenliği
function turetUrunGuvenligi(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.ticaret?.tehlikeli_mi !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      tehlikeli_mi: k.kurumlar.ticaret.tehlikeli_mi,
      tehlike_sinifi: k.kurumlar.ticaret.tehlike_sinifi ?? null,
      tareks_kapsaminda: k.kurumlar.ticaret.tareks_kapsaminda ?? false
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Ticaret Bakanlığı (Tüketicinin Korunması Gen. Müd.)",
    parametre: "urun_guvenligi",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// 16. Borsa Tescil
function turetBorsaTescil(kayitlar) {
  const veri = kayitlar
    .filter(k => k.kurumlar?.ticaret?.borsa_tescil_zorunlu !== undefined)
    .map(k => ({
      gtip_ham: k.gtip_ham,
      borsa_tescil_zorunlu: k.kurumlar.ticaret.borsa_tescil_zorunlu
    }));
  return {
    surum: BUGUN,
    kaynak_kurum: "T.C. Ticaret Bakanlığı + TOBB",
    parametre: "borsa_tescil",
    join_anahtari: "gtip_ham",
    otomatik_uretim: true,
    toplam_kayit: veri.length,
    kayitlar: veri
  };
}

// ─────────────────────────────────────────────────────────
// ANA AKIŞ
// ─────────────────────────────────────────────────────────
function main() {
  console.log("🚀 TC-PVS Türetme Motoru başladı");
  console.log(`📖 Master dizin: ${MASTER_DIR}`);
  console.log(`📁 Çıktı dizin: ${CIKTI_DIR}`);

  const kayitlar = tumKayitlariTopla();
  console.log(`📊 Toplam master kayıt: ${kayitlar.length}`);

  const turetiler = {
    kdv:               turetKdv(kayitlar),
    otv:               turetOtv(kayitlar),
    tevkifat:          turetTevkifat(kayitlar),
    nace:              turetNace(kayitlar),
    kalori:            turetKalori(kayitlar),
    maden_ruhsati:     turetMadenRuhsati(kayitlar),
    kukurt_nem:        turetKukurtNem(kayitlar),
    ced:               turetCed(kayitlar),
    tse_standart:      turetTseStandart(kayitlar),
    ithalat_rejimi:    turetIthalatRejimi(kayitlar),
    ihracat_rejimi:    turetIhracatRejimi(kayitlar),
    gozetim:           turetGozetim(kayitlar),
    kota:              turetKota(kayitlar),
    randiman:          turetRandiman(kayitlar),
    urun_guvenligi:    turetUrunGuvenligi(kayitlar),
    borsa_tescil:      turetBorsaTescil(kayitlar)
  };

  let basarili = 0;
  Object.entries(turetiler).forEach(([ad, veri]) => {
    const yol = path.join(CIKTI_DIR, `${ad}.json`);
    dosyaYaz(yol, veri);
    console.log(`  ✅ ${ad}.json — ${veri.toplam_kayit} kayıt`);
    basarili++;
  });

  console.log(`\n✅ ${basarili}/16 parametre dosyası üretildi`);
  console.log(`📅 Üretim tarihi: ${BUGUN}`);
}

main();