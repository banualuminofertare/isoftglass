import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// All materials from Qualmont catalog
const MATERIALS = [
  // ===== SISTEME DE GLISARE =====
  { code: "37.SS3H.810", name: "Kit glisare duș MOD SS3H", description: "Secțiune rectangulară 30x10 mm, max. 50 kg, Hmax 2200 mm, sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p1_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "37.SS3H.810.11", name: "inox lucios" },
      { code: "37.SS3H.810.12", name: "inox satinat" },
      { code: "37.SS3H.810.15", name: "negru mat" },
      { code: "37.SS3H.810.33", name: "auriu lucios" },
      { code: "37.SS3H.810.37", name: "auriu satinat" },
    ]},
  { code: "72.3010", name: "Țeavă rectangulară 30x10 mm", description: "Bară stabilizatoare 30x10x1.5 mm, disponibilă la metru sau lungimi fixe", material_type: "hardware", unit: "lm", image_url: "/materials/img_p2_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "72.3010.600.11", name: "inox lucios tăiat la metru" },
      { code: "72.3010.600.12", name: "inox satinat tăiat la metru" },
      { code: "72.3010.200.15", name: "negru mat L=2000mm" },
      { code: "72.3010.200.33", name: "auriu lucios L=2000mm" },
      { code: "72.3010.200.37", name: "auriu satinat L=2000mm" },
    ]},
  { code: "32.S308.301", name: "Conector bară stabilizatoare 30x10 mm, țeavă-țeavă 90°", description: "Conector îmbinare bare stabilizatoare rectangulare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p2_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.S308.301.11", name: "inox lucios" },
      { code: "32.S308.301.12", name: "inox satinat" },
      { code: "32.S308.301.15", name: "negru mat" },
      { code: "32.S308.301.33", name: "auriu lucios" },
    ]},
  { code: "32.S440.301", name: "Conector capăt țeavă 30x10 mm, țeavă-sticlă", description: "Conector capăt pentru bare stabilizatoare rectangulare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p2_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.S440.301.11", name: "inox lucios" },
      { code: "32.S440.301.12", name: "inox satinat" },
      { code: "32.S440.301.15", name: "negru mat" },
      { code: "32.S440.301.33", name: "auriu lucios" },
    ]},
  { code: "32.302H.000", name: "Conector fixare panou fix glisant, țeavă 30x10 mm", description: "Conector fixare panou fix pentru sistem glisant", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p2_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.302H.000.11", name: "inox lucios 304" },
      { code: "32.302H.000.12", name: "inox satinat 304" },
      { code: "32.302H.000.15", name: "negru mat" },
      { code: "32.302H.000.17", name: "auriu satinat" },
    ]},

  // MOD 4015
  { code: "29.4015.001", name: "Set duș glisant 4015 perete-perete 180°", description: "L=1500 mm, sticlă 8 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p3_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "29.4015.001.46", name: "alu. anod. argintiu mat" },
      { code: "29.4015.001.26", name: "negru mat" },
    ]},
  { code: "29.4015.002", name: "Set duș glisant 4015 perete-sticlă 90°", description: "L=1500 mm, sticlă 8 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p4_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "29.4015.002.46", name: "alu. anod. argintiu mat" },
      { code: "29.4015.002.26", name: "negru mat" },
    ]},
  { code: "29.4015.004", name: "Set duș glisant 4015 perete-sticlă 90° cu trecere", description: "L=1500 mm, sticlă 8 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p5_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "29.4015.004.46", name: "alu. anod. argintiu mat" },
      { code: "29.4015.004.26", name: "negru mat" },
    ]},
  { code: "46.1810.999", name: "Șină glisare cabină duș 4015", description: "Șină aluminiu pentru sistem glisant 4015", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p6_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "46.1810.999.46", name: "alu. anod. argintiu mat" },
      { code: "46.1810.999.26", name: "negru mat" },
    ]},
  { code: "46.1820.999", name: "Capac mascare șină 1810", description: "Capac mascare pentru șina de glisare 4015", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p6_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "46.1820.999.46", name: "alu. anod. argintiu mat" },
      { code: "46.1820.999.26", name: "negru mat" },
    ]},
  { code: "46.1830.999", name: "Profil acoperire în pasaj de trecere", description: "Profil acoperire zona de trecere sistem 4015", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p6_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "46.1830.999.46", name: "alu. anod. argintiu mat" },
      { code: "46.1830.999.26", name: "negru mat" },
    ]},
  { code: "46.1800.000", name: "Set crucișoare sistem glisant 4015", description: "Max 40 kg, sticlă 8 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p6_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "46.1880.000", name: "Set opritori sistem glisare cabină duș 4015", description: "Opritori pentru limitare cursă glisare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p6_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "46.1850.000", name: "Set accesorii prindere perete sistem 4015", description: "Kit prindere de perete", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p7_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "46.1860.000", name: "Set 2 capace laterale profil 1810", description: "Capace laterale prindere pe sticlă", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p7_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "46.1860.000.46", name: "alu. anod. argintiu mat" },
      { code: "46.1860.000.26", name: "negru mat" },
    ]},
  { code: "46.1870.090", name: "Conector îmbinare 90° glisare cabină duș", description: "Conector colțar pentru sistem 4015", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p7_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "46.1870.090.46", name: "alu. anod. argintiu mat" },
      { code: "46.1870.090.26", name: "negru mat" },
    ]},
  { code: "46.1890.000", name: "Ghidaj pardoseală sistem 4015", description: "Ghidaj de pardoseală pentru sistem glisant 4015", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p7_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "46.1890.000.46", name: "alu. anod. argintiu mat" },
      { code: "46.1890.000.26", name: "negru mat" },
    ]},
  { code: "46.1885.000", name: "Amortizor unilateral sistem glisant 4015", description: "Max 40 kg, panou minim 400-600 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p7_1.jpg", supplier: "Qualmont", variants: [] },

  // Aquant 40
  { code: "6121141150", name: "Set duș glisant Aquant 40 perete-perete 180°", description: "Sticlă 8 mm, L=1150 mm, include amortizare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p8_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "6121141150111", name: "alu. anod. lucios" },
    ]},
  { code: "6122241150", name: "Set duș glisant Aquant 40 perete-perete 90°", description: "Sticlă 8 mm, L=1150 mm, include amortizare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p9_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "612224115011", name: "alu. anod. lucios" },
    ]},
  { code: "6120764880", name: "Profil glisare și capac Aquant 40", description: "L=4880 mm, include garnitură cu deflector", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p10_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "6120764880111", name: "alu. anod. lucios" },
    ]},
  { code: "6120020000", name: "Kit crucișoare Aquant 40", description: "Max 20-40 Kg, sticlă 8 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p10_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "6120020000000", name: "Max 20 Kg" },
      { code: "6120040000000", name: "Max 40 Kg" },
    ]},
  { code: "6120200000", name: "Set prinderi perete-perete Aquant 40", description: "Set colțar îmbinare 90° profil Aquant 40", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p10_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "6120200000410", name: "argintiu lucios" },
      { code: "6120200000419", name: "negru mat" },
    ]},
  { code: "6124620940", name: "Garnitură cu deflector Aquant 40", description: "L=940 mm, sticlă 8 mm, transparent", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p10_2.jpg", supplier: "Qualmont", variants: [] },
  { code: "6124820000", name: "Garnitură siliconică pentru partea fixă Aquant 40", description: "Transparent", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p10_2.jpg", supplier: "Qualmont", variants: [] },
  { code: "6120130000", name: "Set prinderi perete-sticlă Aquant 40 stânga", description: "Prindere laterală stânga", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p11_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "6120140000", name: "Set prinderi perete-sticlă Aquant 40 dreapta", description: "Prindere laterală dreapta", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p11_2.jpg", supplier: "Qualmont", variants: [] },

  // X50
  { code: "095022", name: "Set duș glisant X50 perete-perete 180° soft close", description: "L=2130 mm, max 50 kg, sticlă 8-10 mm, auriu satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p12_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== BALAMALE ȘI CLEME =====
  { code: "30.SH56.T90", name: "Balamă perete-sticlă 90° SH56", description: "Max 45 kg, sticlă 8-10 mm, testat 60.000 cicluri", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p13_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.SH56.T90.31", name: "cromat lucios" },
      { code: "30.SH56.T90.32", name: "cromat satinat" },
      { code: "30.SH56.T90.15", name: "negru mat" },
      { code: "30.SH56.T90.33", name: "auriu lucios" },
      { code: "30.SH56.T90.37", name: "auriu satinat" },
      { code: "30.SH56.T90.39", name: "rose gold periat" },
    ]},
  { code: "30.SH56.L90", name: "Balamă perete-sticlă 90° SH56 3 prinderi", description: "Max 45 kg, sticlă 8-10 mm, 3 prinderi", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p13_5.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.SH56.L90.31", name: "cromat lucios" },
      { code: "30.SH56.L90.32", name: "cromat satinat" },
      { code: "30.SH56.L90.15", name: "negru mat" },
      { code: "30.SH56.L90.33", name: "auriu lucios" },
      { code: "30.SH56.L90.37", name: "auriu satinat" },
    ]},
  { code: "30.SH56.180", name: "Balamă sticlă-sticlă 180° SH56", description: "Max 45 kg, sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p13_9.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.SH56.180.31", name: "cromat lucios" },
      { code: "30.SH56.180.32", name: "cromat satinat" },
      { code: "30.SH56.180.15", name: "negru mat" },
      { code: "30.SH56.180.33", name: "auriu lucios" },
      { code: "30.SH56.180.37", name: "auriu satinat" },
      { code: "30.SH56.180.39", name: "rose gold periat" },
    ]},
  { code: "30.SH56.090", name: "Balamă sticlă-sticlă 90° SH56", description: "Max 45 kg, sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p13_13.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.SH56.090.31", name: "cromat lucios" },
      { code: "30.SH56.090.32", name: "cromat satinat" },
      { code: "30.SH56.090.15", name: "negru mat" },
      { code: "30.SH56.090.33", name: "auriu lucios" },
      { code: "30.SH56.090.37", name: "auriu satinat" },
    ]},
  { code: "30.SH56.135", name: "Balamă sticlă-sticlă 135° SH56", description: "Max 45 kg, sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p13_17.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.SH56.135.31", name: "cromat lucios" },
      { code: "30.SH56.135.32", name: "cromat satinat" },
    ]},

  // Balamale Premium Compact AC56
  { code: "30.AC56.T90", name: "Balamă Premium Compact perete-sticlă 90°", description: "Poziție 0 ajustabilă, max 45 kg, sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p14_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.AC56.T90.31", name: "cromat lucios" },
      { code: "30.AC56.T90.32", name: "cromat satinat" },
      { code: "30.AC56.T90.15", name: "negru mat" },
    ]},
  { code: "30.AC56.L90", name: "Balamă Premium Compact perete-sticlă 90° 3 prinderi", description: "Poziție 0 ajustabilă, max 45 kg, sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p14_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.AC56.L90.31", name: "cromat lucios" },
      { code: "30.AC56.L90.32", name: "cromat satinat" },
      { code: "30.AC56.L90.15", name: "negru mat" },
    ]},
  { code: "30.AC56.180", name: "Balamă Premium Compact sticlă-sticlă 180°", description: "Poziție 0 ajustabilă, max 45 kg, sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p14_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.AC56.180.31", name: "cromat lucios" },
      { code: "30.AC56.180.32", name: "cromat satinat" },
      { code: "30.AC56.180.15", name: "negru mat" },
    ]},
  { code: "41.6512.000", name: "Balamă pivotantă pardoseală-tavan, blocaj 90°", description: "Max 40 kg, sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p14_4.jpg", supplier: "Qualmont",
    variants: [
      { code: "41.6512.000.10", name: "inox lucios" },
      { code: "41.6512.000.12", name: "inox satinat" },
      { code: "41.6512.000.26", name: "negru" },
    ]},
  { code: "30.KDST", name: "Balamă duș cu ridicare", description: "Alu. anod. argintiu lucios, max 32 kg", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p14_5.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.KDST.180.21", name: "L=1800 mm, sticlă 6 mm" },
      { code: "30.KDST.250.21", name: "L=2500 mm, sticlă 6 mm" },
      { code: "30.BHD2.220.31", name: "L=2200 mm, sticlă 8 mm" },
    ]},

  // Balamale armonice
  { code: "41.0202.000", name: "Balamă armonică perete-sticlă 90°", description: "Sticlă 6-10 mm, max 45 kg, permite montare continuă garnitură", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p15_5.jpg", supplier: "Qualmont",
    variants: [
      { code: "41.0202.000.10", name: "inox lucios" },
      { code: "41.0202.000.12", name: "inox satinat" },
      { code: "41.0202.000.26", name: "negru mat" },
    ]},
  { code: "41.0201.000", name: "Balamă armonică sticlă-sticlă 180°", description: "Sticlă 6-10 mm, max 45 kg", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p15_6.jpg", supplier: "Qualmont",
    variants: [
      { code: "41.0201.000.10", name: "inox lucios" },
      { code: "41.0201.000.12", name: "inox satinat" },
      { code: "41.0201.000.26", name: "negru mat" },
    ]},

  // Balamale pliabile BH70
  { code: "30.BH70.090", name: "Balamă duș pliabilă deschidere exterioară 90°", description: "Perete-sticlă, sticlă 6-8 mm, max 45 kg", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p15_7.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.BH70.090.31", name: "cromat lucios" },
      { code: "30.BH70.090.32", name: "cromat satinat" },
      { code: "30.BH70.090.15", name: "negru mat" },
    ]},
  { code: "30.BH70.90E", name: "Balamă duș pliabilă deschidere interioară 90°", description: "Perete-sticlă, sticlă 6-8 mm, max 45 kg", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p15_7.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.BH70.90E.31", name: "cromat lucios" },
      { code: "30.BH70.90E.32", name: "cromat satinat" },
      { code: "30.BH70.90E.15", name: "negru mat" },
    ]},
  { code: "30.BH70.180", name: "Balamă duș pliabilă sticlă-sticlă 180°", description: "Sticlă 6-8 mm, max 45 kg", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p15_7.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.BH70.180.31", name: "cromat lucios" },
      { code: "30.BH70.180.32", name: "cromat satinat" },
      { code: "30.BH70.180.15", name: "negru mat" },
    ]},

  // ===== CLEME =====
  { code: "40.4115.090", name: "Clemă perete-sticlă 90° cu talpă", description: "Sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p16_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "40.4115.090.10", name: "inox lucios 304" },
      { code: "40.4115.090.12", name: "inox satinat 304" },
      { code: "40.4115.090.26", name: "negru mat" },
      { code: "40.4115.090.21", name: "auriu satinat" },
    ]},
  { code: "40.4112.090", name: "Clemă perete-sticlă 90° cu talpă mică", description: "Sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p16_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "40.4112.090.10", name: "inox lucios 304" },
      { code: "40.4112.090.12", name: "inox satinat 304" },
      { code: "40.4112.090.26", name: "negru mat" },
      { code: "40.4112.090.21", name: "auriu satinat" },
    ]},
  { code: "40.4012.090", name: "Clemă sticlă-sticlă 90°", description: "Sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p16_12.jpg", supplier: "Qualmont",
    variants: [
      { code: "40.4012.090.10", name: "inox lucios 304" },
      { code: "40.4012.090.12", name: "inox satinat 304" },
      { code: "40.4012.090.26", name: "negru mat" },
      { code: "40.4012.090.21", name: "auriu satinat" },
    ]},
  { code: "40.4012.180", name: "Clemă sticlă-sticlă 180°", description: "Sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p17_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "40.4012.180.10", name: "inox lucios 304" },
      { code: "40.4012.180.12", name: "inox satinat 304" },
      { code: "40.4012.180.26", name: "negru mat" },
      { code: "40.4012.180.21", name: "auriu satinat" },
    ]},
  { code: "31.SB45.090", name: "Clemă perete-sticlă 90° cu talpă SB45", description: "Sticlă 6-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p17_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "31.SB45.090.31", name: "cromat lucios" },
      { code: "31.SB45.090.32", name: "cromat satinat" },
      { code: "31.SB45.090.35", name: "negru mat" },
      { code: "31.SB45.090.33", name: "auriu lucios" },
      { code: "31.SB45.090.37", name: "auriu satinat" },
    ]},
  { code: "31.SB45.290", name: "Clemă sticlă-sticlă 90° SB45", description: "Sticlă 6-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p17_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "31.SB45.290.31", name: "cromat lucios" },
      { code: "31.SB45.290.32", name: "cromat satinat" },
    ]},

  // ===== BUTONI ȘI MÂNERE =====
  { code: "33.DK25.030", name: "Buton trăgător duș Ø30x30 mm", description: "Sticlă 6-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p18_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "33.DK25.030.31", name: "cromat lucios" },
      { code: "33.DK25.030.32", name: "cromat satinat" },
      { code: "33.DK25.030.35", name: "negru mat" },
      { code: "33.DK25.030.33", name: "auriu lucios" },
      { code: "33.DK25.030.37", name: "auriu satinat" },
      { code: "33.DK25.030.39", name: "rose gold periat" },
    ]},
  { code: "33.DK10.032", name: "Buton trăgător duș Ø32x30 mm", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p18_2.png", supplier: "Qualmont",
    variants: [
      { code: "33.DK10.032.31", name: "cromat lucios" },
      { code: "33.DK10.032.34", name: "cromat satinat" },
      { code: "33.DK10.032.35", name: "negru mat" },
    ]},
  { code: "33.K222.035", name: "Buton trăgător duș Ø35 mm", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p18_7.jpg", supplier: "Qualmont",
    variants: [
      { code: "33.K222.035.31", name: "inox cromat lucios" },
      { code: "33.K222.035.15", name: "negru mat" },
    ]},
  { code: "47.0101.040", name: "Buton trăgător duș Ø40 mm", description: "Sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p18_8.jpg", supplier: "Qualmont",
    variants: [
      { code: "47.0101.040.10", name: "inox lucios" },
      { code: "47.0101.040.12", name: "inox satinat" },
    ]},
  { code: "33.K215.030", name: "Buton trăgător duș Ø30 mm negru", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p18_13.jpg", supplier: "Qualmont",
    variants: [
      { code: "33.K215.030.15", name: "negru mat" },
    ]},
  { code: "33.DK27.027", name: "Buton trăgător duș 27x27x33 mm", description: "Sticlă 6-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p19_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "33.DK27.027.31", name: "cromat lucios" },
      { code: "33.DK27.027.32", name: "cromat satinat" },
      { code: "33.DK27.027.35", name: "negru mat" },
    ]},
  { code: "33.DP26.030", name: "Buton trăgător duș Ø30x30 mm DP26", description: "Sticlă 6-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p19_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "33.DP26.030.31", name: "cromat lucios" },
    ]},
  { code: "33.DP40.036", name: "Buton trăgător duș 36x30 mm", description: "Sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p19_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "33.DP40.036.34", name: "cromat satinat" },
      { code: "33.DP40.036.35", name: "negru mat" },
      { code: "33.DP40.036.37", name: "auriu satinat" },
    ]},
  { code: "19.KG02.813", name: "Încuietoare sticlă-sticlă", description: "Sticlă 8-13 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p19_4.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.KG02.813.12", name: "inox satinat" },
    ]},
  { code: "47.0117.055", name: "Mâner bilă Ø55 mm saună", description: "Sticlă 6-12 mm, gaură sticlă Ø8 mm, fag nefinisat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p19_4.jpg", supplier: "Qualmont", variants: [] },

  // Mânere scoică
  { code: "51.SH10.058", name: "Mâner scoică Ø58 mm", description: "Gaură 47-50 mm, sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p20_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "51.SH10.058.11", name: "inox lucios 304" },
      { code: "51.SH10.058.12", name: "inox satinat 304" },
      { code: "51.SH10.058.15", name: "negru mat" },
      { code: "51.SH10.058.33", name: "auriu lucios" },
      { code: "51.SH10.058.37", name: "auriu satinat" },
    ]},
  { code: "47.0103.060", name: "Mâner scoică Ø60 mm", description: "Gaură sticlă Ø50 mm, sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p20_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "47.0103.060.10", name: "inox lucios 304" },
      { code: "47.0103.060.12", name: "inox satinat 304" },
      { code: "47.0103.060.26", name: "negru mat" },
    ]},
  { code: "47.0104.060", name: "Mâner scoică Ø60 mm cu trecere", description: "Gaură sticlă Ø50 mm, sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p20_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "47.0104.060.10", name: "inox lucios 304" },
      { code: "47.0104.060.12", name: "inox satinat 304" },
      { code: "47.0104.060.26", name: "negru mat" },
    ]},
  { code: "47.4103.465", name: "Mâner scoică pătrat 65x65 mm", description: "Gaură sticlă Ø56 mm, sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p20_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "47.4103.465.12", name: "inox satinat" },
      { code: "47.4103.465.26", name: "negru mat" },
    ]},

  // Mânere tip C
  { code: "50.SH19.152", name: "Mâner trăgător C Ø19 mm interax 152 mm", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p21_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.SH19.152.11", name: "inox lucios" },
      { code: "50.SH19.152.15", name: "negru mat" },
    ]},
  { code: "50.SH19.203", name: "Mâner trăgător C Ø19 mm interax 203 mm", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p21_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.SH19.203.11", name: "inox lucios" },
      { code: "50.SH19.203.33", name: "auriu lucios" },
      { code: "50.SH19.203.37", name: "auriu satinat" },
    ]},
  { code: "50.D225.300", name: "Mâner trăgător C 25x25 mm interax 300 mm", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p21_3.png", supplier: "Qualmont",
    variants: [
      { code: "50.D225.300.11", name: "inox lucios" },
      { code: "50.D225.300.12", name: "inox satinat" },
      { code: "50.D225.300.15", name: "negru mat" },
    ]},

  // Bare port-prosop
  { code: "50.BR19.400", name: "Port-prosop tip C Ø19 mm interax 400 mm", description: "Port-prosop din inox", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p22_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.BR19.400.15", name: "negru mat" },
      { code: "50.BR19.400.11", name: "inox lucios" },
    ]},
  { code: "50.D125.400", name: "Port-prosop cu buton Ø25 mm interax 400 mm", description: "Port-prosop din inox cu buton", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p22_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.D125.400.11", name: "inox lucios" },
      { code: "50.D125.400.12", name: "inox satinat" },
    ]},
  { code: "50.SH02.457", name: "Mâner Ø19 mm port-prosop L=457 mm", description: "Mâner L=152 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p22_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.SH02.457.11", name: "inox lucios" },
    ]},
  { code: "33.KDGH.500", name: "Port-prosop rectangular cu buton L=530 mm", description: "Interax 500 mm, 10x30 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p22_4.jpg", supplier: "Qualmont",
    variants: [
      { code: "33.KDGH.500.11", name: "inox lucios" },
    ]},

  // ===== BARE STABILIZATOARE ROTUNDE =====
  { code: "99.S019.100", name: "Set bară stabilizare Ø19 mm perete-sticlă 90°", description: "L=1000 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p23_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "99.S019.100.11", name: "inox lucios" },
      { code: "99.S019.100.12", name: "inox satinat" },
    ]},
  { code: "72.TR19", name: "Țeavă Ø19 mm", description: "Bară stabilizatoare rotundă Ø19x1.5 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p23_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "72.TR19.100.11", name: "inox lucios tăiat la metru" },
      { code: "72.TR19.100.12", name: "inox satinat tăiat la metru" },
      { code: "72.SR4T.100.15", name: "negru mat L=1000mm" },
      { code: "72.SR4T.100.33", name: "auriu lucios L=1000mm" },
      { code: "72.SR4T.200.15", name: "negru mat L=2000mm" },
      { code: "72.SR4T.200.33", name: "auriu lucios L=2000mm" },
      { code: "72.SR4T.200.37", name: "auriu satinat L=2000mm" },
      { code: "72.SR4T.200.39", name: "rose gold periat L=2000mm" },
    ]},
  { code: "32.S36B.019", name: "Conector bară Ø19 mm perete-țeavă 90°", description: "Conector perete-bară stabilizatoare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p24_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.S36B.019.31", name: "cromat lucios" },
      { code: "32.S36B.019.34", name: "cromat satinat" },
      { code: "32.S36B.019.15", name: "negru mat" },
      { code: "32.S36B.019.33", name: "auriu lucios" },
      { code: "32.S36B.019.37", name: "auriu satinat" },
      { code: "32.S36B.019.39", name: "rose gold periat" },
    ]},
  { code: "32.S260.019", name: "Conector bară Ø19 mm perete-țeavă 45°", description: "Conector la 45 grade", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p24_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.S260.019.31", name: "cromat lucios" },
      { code: "32.S260.019.23", name: "vopsit negru mat" },
    ]},
  { code: "32.S28A.019", name: "Conector bară Ø19 mm reglabil perete-țeavă", description: "Unghi reglabil", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p24_4.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.S28A.019.31", name: "cromat lucios" },
      { code: "32.S28A.019.34", name: "cromat satinat" },
      { code: "32.S28A.019.35", name: "negru mat" },
      { code: "32.S28A.019.33", name: "auriu lucios" },
    ]},
  { code: "32.S12C.019", name: "Conector bară Ø19 mm fără trecere țeavă-sticlă", description: "Sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p25_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.S12C.019.31", name: "cromat lucios" },
      { code: "32.S12C.019.34", name: "cromat satinat" },
      { code: "32.S12C.019.35", name: "negru mat" },
      { code: "32.S12C.019.33", name: "auriu lucios" },
      { code: "32.S12C.019.37", name: "auriu satinat" },
      { code: "32.S12C.019.39", name: "rose gold periat" },
    ]},
  { code: "32.S11B.019", name: "Conector bară Ø19 mm cu trecere țeavă-sticlă", description: "Sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p25_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.S11B.019.31", name: "cromat lucios" },
      { code: "32.S11B.019.34", name: "cromat satinat" },
      { code: "32.S11B.019.35", name: "negru mat" },
      { code: "32.S11B.019.33", name: "auriu lucios" },
      { code: "32.S11B.019.37", name: "auriu satinat" },
    ]},
  { code: "32.RC17.019", name: "Conector bară Ø19 mm țeavă-țeavă 90°", description: "Conector T", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p25_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.RC17.019.11", name: "inox lucios" },
      { code: "32.RC17.019.12", name: "inox satinat" },
      { code: "32.RC17.019.15", name: "negru mat" },
    ]},
  { code: "32.S140.019", name: "Conector bară Ø19 mm reglabil țeavă-țeavă", description: "Unghi reglabil", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p25_4.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.S140.019.31", name: "cromat lucios" },
      { code: "32.S140.019.32", name: "cromat satinat" },
      { code: "32.S140.019.15", name: "negru mat" },
      { code: "32.S140.019.33", name: "auriu lucios" },
      { code: "32.S140.019.37", name: "auriu satinat" },
    ]},

  // ===== BARE STABILIZATOARE RECTANGULARE =====
  { code: "72.K100.210", name: "Țeavă bară stabilizatoare rectangulară 20x10 mm", description: "Disponibilă L=1000/2000 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p27_1.png", supplier: "Qualmont",
    variants: [
      { code: "72.K100.210.11", name: "inox lucios L=1000mm" },
      { code: "72.K200.210.11", name: "inox lucios L=2000mm" },
      { code: "72.K200.210.15", name: "negru mat L=2000mm" },
    ]},
  { code: "32.K301.210", name: "Conector bară 20x10 mm perete-țeavă 90°", description: "Conector perete-bară rectangulară", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p27_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.K301.210.31", name: "cromat lucios" },
      { code: "32.K301.210.15", name: "negru mat" },
    ]},
  { code: "32.K313.210", name: "Conector bară 20x10 mm fără trecere sticlă-țeavă", description: "Sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p27_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.K313.210.31", name: "cromat lucios" },
      { code: "32.K313.210.15", name: "negru mat" },
    ]},
  { code: "32.RC61.210", name: "Conector bară 20x10 mm cu trecere țeavă-sticlă", description: "Sticlă 6-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p27_4.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.RC61.210.31", name: "cromat lucios" },
      { code: "32.RC61.210.15", name: "negru mat" },
    ]},

  // Bare 15x15
  { code: "72.1515.200", name: "Țeavă bară stabilizatoare pătrată 15x15 mm", description: "L=2000 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p28_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "72.1515.200.11", name: "inox lucios" },
      { code: "72.1515.200.12", name: "inox satinat" },
    ]},
  { code: "32.S235.S15", name: "Conector bară 15x15 mm perete-țeavă", description: "Sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p28_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.S235.S15.11", name: "inox lucios" },
      { code: "32.S235.S15.12", name: "inox satinat" },
    ]},

  // Colțar rigidizare
  { code: "32.SB0L.090", name: "Colțar perete-sticlă rigidizare stânga", description: "Sticlă 8-10 mm, L=180x120x25 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p29_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.SB0L.090.31", name: "cromat lucios" },
      { code: "32.SB0L.090.35", name: "negru mat" },
    ]},
  { code: "32.SB0R.090", name: "Colțar perete-sticlă rigidizare dreapta", description: "Sticlă 8-10 mm, L=180x120x25 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p29_4.jpg", supplier: "Qualmont",
    variants: [
      { code: "32.SB0R.090.31", name: "cromat lucios" },
      { code: "32.SB0R.090.35", name: "negru mat" },
    ]},

  // ===== GARNITURI =====
  { code: "34.SET6", name: "Set garnitură magnetică 90°-180°", description: "Sticlă 8-10 mm, rezistentă UV", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p30_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.SET6.201.02", name: "L=2010mm PVC transparent" },
      { code: "34.SET6.220.02", name: "L=2200mm PVC transparent" },
      { code: "34.SET6.220.61", name: "L=2200mm PVC negru" },
      { code: "34.SET6.500.02", name: "L=2500mm PVC transparent" },
      { code: "34.SET6.250.61", name: "L=2500mm PVC negru" },
      { code: "34.SET6.30T.02", name: "L=3000mm PVC transparent" },
      { code: "34.SET6.300.61", name: "L=3000mm PVC negru" },
    ]},
  { code: "34.SET7", name: "Set garnitură magnetică 135°", description: "Sticlă 8-10 mm", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p30_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.SET7.T25.02", name: "L=2500mm magnet alb transparent" },
      { code: "34.SET7.250.61", name: "L=2500mm magnet negru" },
    ]},
  { code: "34.SET8", name: "Set garnitură magnetică 180°", description: "Sticlă 8-10 mm", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p30_5.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.SET8.250.02", name: "L=2500mm magnet alb transparent" },
      { code: "34.SET8.250.61", name: "L=2500mm magnet negru" },
    ]},
  { code: "34.GG10", name: "Profil fixare garnitură magnetică-zid", description: "L=2200 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p31_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.GG10.220.21", name: "alu. anod. argintiu lucios" },
      { code: "34.GG10.220.22", name: "alu. efect inox satinat" },
      { code: "34.GG10.220.27", name: "negru mat" },
    ]},
  { code: "34.G052", name: "Garnitură balon sticlă 6-8 mm", description: "Rezistentă UV", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p31_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.G052.220.02", name: "L=2200mm transparent" },
      { code: "34.G052.220.61", name: "L=2200mm negru" },
      { code: "34.G052.250.02", name: "L=2500mm transparent" },
      { code: "34.G052.250.61", name: "L=2500mm negru" },
    ]},
  { code: "34.G053", name: "Garnitură balon sticlă 8-10 mm", description: "Rezistentă UV", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p31_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.G053.250.02", name: "L=2500mm transparent" },
      { code: "34.G053.250.61", name: "L=2500mm negru" },
      { code: "34.G053.300.02", name: "L=3000mm transparent" },
      { code: "34.G053.300.61", name: "L=3000mm negru" },
    ]},
  { code: "34.G042", name: "Garnitură h cu aripioară sticlă 6-8 mm", description: "Diverse dimensiuni aripioară", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p31_4.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.G042.612.02", name: "arip. 12mm L=2200mm transparent" },
      { code: "34.G042.612.61", name: "arip. 12mm L=2200mm negru" },
      { code: "34.G042.616.02", name: "arip. 16mm L=2200mm transparent" },
      { code: "34.G042.616.61", name: "arip. 16mm L=2500mm negru" },
    ]},
  { code: "34.G043", name: "Garnitură h cu aripioară sticlă 8-10 mm", description: "Diverse dimensiuni aripioară", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p31_5.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.G043.825.02", name: "arip. 12mm L=2500mm transparent" },
      { code: "34.G043.250.02", name: "arip. 16mm L=2500mm transparent" },
      { code: "34.G043.250.61", name: "arip. 16mm L=2500mm negru" },
      { code: "34.G043.316.02", name: "arip. 16mm L=3000mm transparent" },
      { code: "34.G043.316.61", name: "arip. 16mm L=3000mm negru" },
    ]},

  // Garnituri speciale
  { code: "34.G023.807", name: "Garnitură cu aripioară pe mijloc și picurător", description: "Sticlă 8-10 mm", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p32_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.G023.807.02", name: "L=2000mm transparent" },
      { code: "34.G023.807.61", name: "L=2000mm negru" },
    ]},
  { code: "34.G014", name: "Garnitură F cu aripioară sticlă 8-10 mm", description: "Diverse dimensiuni", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p33_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.G014.162.02", name: "arip. 16mm L=2500mm transparent" },
      { code: "34.G014.163.02", name: "arip. 16mm L=3000mm transparent" },
      { code: "34.G014.823.02", name: "arip. 23mm L=2500mm transparent" },
      { code: "34.G014.823.61", name: "arip. 23mm L=2500mm negru" },
    ]},
  { code: "34.GC50.500", name: "Garnitură tip balon auto adezivă", description: "Sticlă 8-10 mm, L=5000 mm", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p33_14.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.GC50.500.03", name: "L=5000mm transparent" },
      { code: "19.4023.000.61", name: "L=5000mm negru" },
    ]},

  // ===== PRAGURI =====
  { code: "34.PSP1", name: "Prag pardoseală bandă auto-adezivă ultraclar", description: "Acrilic transparent", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p34_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.PSP1.205.03", name: "H=5mm L=2000mm" },
    ]},
  { code: "34.PSP2", name: "Prag pardoseală H=10 mm", description: "Acrilic transparent, diverse lungimi", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p34_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.PSP2.110.03", name: "H=10mm L=1000mm" },
      { code: "34.PSP2.210.03", name: "H=10mm L=2000mm" },
      { code: "34.PSP2.251.03", name: "H=10mm L=2500mm" },
    ]},
  { code: "34.A159.200", name: "Prag pardoseală 15x9 mm", description: "L=2000 mm aluminiu", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p34_4.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.A159.200.30", name: "alu. cromat lucios" },
      { code: "34.A159.200.32", name: "alu. efect inox satinat" },
      { code: "34.A159.200.35", name: "negru mat" },
    ]},
  { code: "34.A175.R90", name: "Conector capăt prag pardoseală dreapta", description: "17.5x30 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p34_6.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.A175.R90.30", name: "cromat lucios" },
      { code: "34.A175.R90.32", name: "cromat satinat" },
      { code: "34.A175.R90.35", name: "negru mat" },
    ]},
  { code: "34.A175.L90", name: "Conector capăt prag pardoseală stânga", description: "17.5x30 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p34_14.jpg", supplier: "Qualmont",
    variants: [
      { code: "34.A175.L90.30", name: "cromat lucios" },
      { code: "34.A175.L90.32", name: "cromat satinat" },
      { code: "34.A175.L90.35", name: "negru mat" },
    ]},

  // ===== PROFILE U ALUMINIU =====
  { code: "11.1914.600", name: "Profil U 19x14x19x1.9 mm", description: "Sticlă 8-10 mm, L=6000 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p35_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "11.1914.600.21", name: "alu. anod. argintiu lucios" },
      { code: "11.1914.600.22", name: "alu. efect inox satinat" },
      { code: "11.1914.600.23", name: "alu. vopsit RAL 9005 mat" },
      { code: "11.1914.600.28", name: "alu. anod. auriu semilucios" },
      { code: "11.1914.600.37", name: "alu. anod. auriu satinat" },
      { code: "11.1914.600.38", name: "alu. anod. auriu mat" },
    ]},
  { code: "11.1515.600", name: "Profil U 15x15x15x2 mm", description: "Sticlă 8-10 mm, L=5900 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p35_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "11.1515.600.24", name: "alu. anod. argintiu mat" },
      { code: "11.1515.600.27", name: "alu. anod. negru" },
    ]},

  // ===== ACCESORII BAIE =====
  { code: "22.1210.000", name: "Suport poliță 27×30 mm", description: "Max 5 kg, sticlă 6-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p38_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "22.1210.000.23", name: "cromat lucios" },
      { code: "22.1210.000.20", name: "inox satinat" },
    ]},
  { code: "24.KG10.000", name: "Suport poliță 30×21 mm", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p38_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "24.KG10.000.32", name: "inox satinat" },
    ]},
  { code: "24.KG65.610", name: "Suport poliță 25x30 mm", description: "Sticlă 6-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p38_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "24.KG65.610.15", name: "negru mat" },
    ]},
  { code: "48.5116.000", name: "Set accesorii fixare mecanică oglindă", description: "Max 1.6 m²", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p38_4.jpg", supplier: "Qualmont", variants: [] },

  // Curățare
  { code: "EB1701", name: "Spray curățare sticlă-oglindă 600 ml", description: "Spray cu aerosoli CRL", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p39_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "4910110", name: "Soluție tratament anticalcar sticlă duș 300 ml", description: "CLEAN-X, protecție durabilă până la 15 ani", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p39_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "75.KSCH.000", name: "Foarfecă profesională pentru tăiat garnituri", description: "Made in Germany", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p39_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== PROFILE ȘI TOCURI COMPARTIMENTĂRI (pag. 51-58) =====
  { code: "10.MCPE.508", name: "Corp șină perimetrală Economy sticlă 8 mm", description: "L=5000 mm, 3 cleme + șurub /m și 1 cală /m", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "10.MCPE.508.20", name: "aluminiu nefinisat" },
    ]},
  { code: "10.MCPE.510", name: "Corp șină perimetrală Economy sticlă 10 mm", description: "L=5000 mm, 3 cleme + șurub /m și 1 cală /m", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "10.MCPE.510.20", name: "aluminiu nefinisat" },
    ]},
  { code: "10.MCPE.512", name: "Corp șină perimetrală Economy sticlă 12 mm", description: "L=5000 mm, 3 cleme + șurub /m și 1 cală /m", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "10.MCPE.512.20", name: "aluminiu nefinisat" },
    ]},
  { code: "10.MCPE.517", name: "Corp șină perimetrală Economy sticlă 16.76 mm", description: "L=5000 mm, 3 cleme + șurub /m și 1 cală /m", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "10.MCPE.517.20", name: "aluminiu nefinisat" },
    ]},
  { code: "10.MCPC.510", name: "Corp șină perimetrală Comfort sticlă 10 mm", description: "L=5000 mm, cleme reglabile, 3 cleme + șurub /m", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "10.MCPC.510.20", name: "aluminiu nefinisat" },
    ]},
  { code: "10.MCPC.512", name: "Corp șină perimetrală Comfort sticlă 12 mm", description: "L=5000 mm, cleme reglabile, 3 cleme + șurub /m", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "10.MCPC.512.20", name: "aluminiu nefinisat" },
    ]},
  { code: "25.4195.541", name: "Capac lateral profil perimetral", description: "H=40 mm, L=5000 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "25.4195.541.24", name: "alu. anod. argintiu mat" },
      { code: "25.4195.541.22", name: "efect inox satinat" },
      { code: "25.4195.541.27", name: "alu. anod. negru mat" },
    ]},
  { code: "25.MC4E.810", name: "Set 2 capace capăt șină perimetrală 8-10 mm", description: "30x41 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "25.MC4E.810.24", name: "alu. anod. argintiu mat" },
      { code: "25.MC4E.810.22", name: "efect inox satinat" },
      { code: "25.MC4E.810.27", name: "alu. anod. negru mat" },
    ]},
  { code: "25.MC4E.012", name: "Set 2 capace capăt șină perimetrală 12 mm", description: "32 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "25.MC4E.012.24", name: "alu. anod. argintiu mat" },
      { code: "25.MC4E.012.22", name: "efect inox satinat" },
      { code: "25.MC4E.012.27", name: "alu. anod. negru mat" },
    ]},
  // Garnituri etanșare
  { code: "71.ND10.002", name: "Garnitură pană 2 mm PVC", description: "L=10 m sau rolă 200 m", material_type: "consumable", unit: "lm", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "71.ND10.002.00", name: "transparent" },
      { code: "71.ND10.002.05", name: "negru mat" },
    ]},
  { code: "71.ND20.004", name: "Garnitură pană 4 mm PVC", description: "L=10 m sau rolă 200 m", material_type: "consumable", unit: "lm", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "71.ND20.004.00", name: "transparent" },
      { code: "71.ND20.004.05", name: "negru mat" },
    ]},
  // Profile PVC îmbinare
  { code: "22.6P08.180", name: "Profil îmbinare H autoadeziv sticlă 8 mm", description: "L=3000 mm, PVC ultraclar", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "22.6P08.180.03", name: "PVC ultraclar" },
    ]},
  { code: "22.6P10.180", name: "Profil îmbinare H autoadeziv sticlă 10 mm", description: "L=3000 mm, PVC ultraclar", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "22.6P10.180.03", name: "PVC ultraclar" },
    ]},
  { code: "22.6P12.180", name: "Profil îmbinare H autoadeziv sticlă 12 mm", description: "L=3000 mm, PVC ultraclar", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p42_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "22.6P12.180.03", name: "PVC ultraclar" },
    ]},
  // Toc Dorma Flipp
  { code: "2761384", name: "Profil toc Flipp Dorma", description: "L=5600 mm, sticlă 8-10 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p45_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "2761385", name: "Profil clips Flipp Dorma", description: "L=5600 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p45_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "2761239", name: "Set colțare îmbinare profil toc Flipp Dorma", description: "Set colțare toc Flipp", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p45_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "2761387", name: "Corp profil cu clips 45x25 mm Flipp Dorma", description: "L=6000 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p45_1.jpg", supplier: "Qualmont", variants: [] },
  // Toc KPZ
  { code: "15.7741.550", name: "Profil toc zid tip KPZ", description: "L=5500 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p46_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "15.7741.550.20", name: "alu. nefinisat" },
      { code: "15.7741.550.24", name: "alu. anod. argintiu mat" },
      { code: "15.7741.550.23", name: "alu. vopsit RAL 9005" },
    ]},
  { code: "74.KPZW.000", name: "Set 4 colțare toc KPZ", description: "Set colțare îmbinare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p46_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "74.KPZW.000.50", name: "standard" },
    ]},
  // Toc preluare Sky
  { code: "15.7240.560", name: "Toc preluare Sky L=5600 mm", description: "Profil toc preluare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p47_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "15.7240.560.24", name: "alu. anod. argintiu mat" },
      { code: "15.7240.560.27", name: "alu. anod. negru mat" },
    ]},
  { code: "15.7240.600", name: "Toc preluare Sky L=6000 mm", description: "Profil toc preluare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p47_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "15.7240.600.24", name: "alu. anod. argintiu mat" },
      { code: "15.7240.600.27", name: "alu. anod. negru mat" },
    ]},
  // Praguri căzătoare
  { code: "55.1340.930", name: "Prag căzător auto-adeziv L=930 mm", description: "Alte dimensiuni la cerere: 830, 1030, 1130 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p48_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "55.1340.930.24", name: "alu. anod. argintiu mat" },
      { code: "55.1340.930.27", name: "alu. anod. negru" },
    ]},

  // ===== FERONERIE ȘI ACCESORII UȘI STICLĂ (pag. 60-84) =====
  // Balamale uși pe toc
  { code: "14.LH86.810", name: "Balamă ușă toc LH86", description: "Max 60 kg, sticlă 8-10 mm, Ø16", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p52_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "14.LH86.810.24", name: "alu. anod. argintiu mat" },
      { code: "14.LH86.810.12", name: "inox satinat" },
      { code: "14.LH86.810.27", name: "negru mat" },
    ]},
  { code: "81209015099", name: "Balamă ușă toc Dorma Junior Office", description: "Max 55 kg, sticlă 8-10 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p52_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "81023015099", name: "Balamă ușă toc Dorma Studio Rondo sticlă 8 mm", description: "Max 45 kg, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p52_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "81023615099", name: "Balamă ușă toc Dorma Studio Rondo sticlă 10 mm", description: "Max 45 kg, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p52_1.jpg", supplier: "Qualmont", variants: [] },
  // Balamale hidraulice Biloba EVO Frame
  { code: "835E10NR02", name: "Balamă hidraulică Biloba EVO Frame perete-sticlă dreapta", description: "Max 120 kg, sticlă 8-21.52 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p52_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "835E10NL02", name: "Balamă hidraulică Biloba EVO Frame perete-sticlă stânga", description: "Max 120 kg, sticlă 8-21.52 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p52_1.jpg", supplier: "Qualmont", variants: [] },
  // Broaște și mânere
  { code: "81010215099", name: "Set broască cu încuiere și 2 balamale Dorma Studio Rondo", description: "Sticlă 8 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p54_1.png", supplier: "Qualmont", variants: [] },
  { code: "81010615099", name: "Set broască încuiere WC și 2 balamale Dorma Studio Rondo", description: "Sticlă 8 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p54_1.png", supplier: "Qualmont", variants: [] },
  { code: "81020215099", name: "Broască cu încuiere Dorma Studio Rondo", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p54_1.png", supplier: "Qualmont", variants: [] },
  { code: "82420211499", name: "Broască cu încuiere Dorma Studio Arcos", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p54_1.png", supplier: "Qualmont", variants: [] },
  { code: "16.LK53.810", name: "Broască cu încuiere sticlă 8-10 mm", description: "Broască silențioasă cu reglare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p55_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "16.LK53.810.24", name: "alu. anod. argintiu mat" },
      { code: "16.LK53.810.12", name: "inox satinat" },
      { code: "16.LK53.810.23", name: "alu. vopsit RAL 9005 mat" },
    ]},
  { code: "16.FK53.810", name: "Broască fără încuiere mâner spate", description: "Sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p55_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "16.FK53.810.24", name: "alu. anod. argintiu mat" },
    ]},
  { code: "16.FK50.810", name: "Broască fără încuiere mâner față", description: "Sticlă 8-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p55_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "16.FK50.810.24", name: "alu. anod. argintiu mat" },
      { code: "16.FK50.810.23", name: "alu. vopsit RAL 9005" },
    ]},
  { code: "19.LK50.810", name: "Contrabroască sticlă 8-12 mm", description: "Nu mai este necesară frezarea suplimentară", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p55_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.LK50.810.24", name: "alu. anod. argintiu mat" },
      { code: "19.LK50.810.12", name: "inox satinat" },
      { code: "19.LK50.810.27", name: "alu. vopsit RAL 9005 mat" },
    ]},
  // Mânere broaște
  { code: "81031415099", name: "Set mâner broască Dorma Studio Rondo", description: "Alu. anod. argintiu mat, interax 115 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p56_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "81031415099", name: "alu. anod. argintiu mat" },
      { code: "81031415099N", name: "vopsit negru mat" },
    ]},
  { code: "82430111499", name: "Set mâner broască Dorma Studio Arcos", description: "Alu. anod. argintiu mat, interax 120 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p56_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "47.6010.020", name: "Set mâner broască drept", description: "Interax 125 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p56_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "47.6010.020.12", name: "inox satinat" },
      { code: "47.6010.020.23", name: "vopsit negru" },
    ]},
  { code: "47.6000.020", name: "Set mâner broască rotund", description: "Interax 130 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p56_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "47.6000.020.12", name: "inox satinat" },
      { code: "47.6000.020.23", name: "vopsit negru" },
    ]},
  // Cilindri
  { code: "45.D130.000", name: "Cilindru Dorma DEC50 30x30 mm", description: "3 chei, nichel mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p58_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "45.D130.000.99", name: "nichel mat" },
    ]},
  { code: "45.DF13.000", name: "Cilindru Dorma DEC fluture 30x30 mm", description: "3 chei, nichel mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p58_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "45.DF13.000.99", name: "nichel mat" },
    ]},
  { code: "45.EC30.000", name: "Cilindru standard 12x20.8 mm", description: "3 chei", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p58_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "45.EC30.000.99", name: "nichel mat" },
      { code: "45.EC30.000.13", name: "negru mat" },
    ]},
  // Amortizoare și pivoți pardoseală
  { code: "62BTS", name: "Set amortizor pardoseală Dorma BTS 84", description: "Cu blocaj 90°, capac și insert standard inclus", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p59_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "BTS84", name: "inox satinat" },
    ]},
  { code: "61701200", name: "Amortizor pardoseală Dorma BTS 75V", description: "Cu insert standard și blocaj la 90°", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p59_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "81210001", name: "Amortizor pardoseală BTS 84 EN 3 cu blocaj 90°", description: "Fără insert", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p59_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "103974", name: "Amortizor pardoseală TS500NV EN 1-4", description: "Cu insert standard și blocare 85°", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p59_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "13.PTBO.000", name: "Pivot pardoseală max 100 kg", description: "Pivot pardoseală inox", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p59_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "13.PTBO.000.12", name: "inox satinat" },
    ]},
  // Balamale PT
  { code: "80350270099", name: "Balamă inferioară Dorma PT10 Universal Light", description: "Sticlă 10-12 mm, inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "80350270099", name: "inox satinat" },
      { code: "80350270099N", name: "vopsit negru" },
    ]},
  { code: "80351270099", name: "Balamă superioară Dorma PT20 Universal Light", description: "Sticlă 10-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "80351270099", name: "inox satinat" },
      { code: "80351270099N", name: "vopsit negru" },
    ]},
  { code: "80362370099", name: "Pivot superior Dorma PT24 Universal Light", description: "Placă H=3 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "80362370099", name: "inox satinat" },
      { code: "80362370099N", name: "vopsit negru" },
    ]},
  { code: "80354270099", name: "Colțar supralumină Dorma PT40 Universal Light", description: "Sticlă 10-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "80354270099", name: "inox satinat" },
      { code: "80354270099N", name: "vopsit negru" },
    ]},
  { code: "80352270099", name: "Balamă supralumină Dorma PT30 Universal Light", description: "Sticlă 10-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "80352270099", name: "inox satinat" },
      { code: "80352270099N", name: "vopsit negru" },
    ]},
  { code: "12.KP10.812", name: "Balamă PT10 sticlă 8-12 mm", description: "Inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "12.KP10.812.12", name: "inox satinat" },
    ]},
  { code: "12.KP20.812", name: "Balamă PT20 sticlă 8-12 mm", description: "Inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "12.KP20.812.12", name: "inox satinat" },
    ]},
  { code: "12.KP24.000", name: "Pivot superior PT24", description: "Pivot superior", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "12.KP24.000.12", name: "inox satinat" },
      { code: "12.KP24.000.13", name: "vopsit RAL 9005 mat" },
    ]},
  { code: "12.KP31.812", name: "Balamă supralumină PT31 sticlă 8-12 mm", description: "Inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "12.KP31.812.12", name: "inox satinat" },
    ]},
  { code: "12.KP40.812", name: "Colțar supralumină PT40 sticlă 8-12 mm", description: "Pivot Ø15 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "12.KP40.812.12", name: "inox satinat" },
    ]},
  { code: "12.KP60.812", name: "Colțar PT60 sticlă 8-12 mm", description: "Colțar supralumină", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "12.KP60.812.12", name: "inox satinat" },
    ]},
  { code: "13.KP42.D10", name: "Colțar supralumină 90° dreapta PT42", description: "Sticlă 10-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "13.KP42.D10.12", name: "inox satinat" },
    ]},
  { code: "13.KP42.S10", name: "Colțar supralumină 90° stânga PT42", description: "Sticlă 10-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "13.KP42.S10.12", name: "inox satinat" },
    ]},
  { code: "19.KU10.812", name: "Încuietoare de colț US10 cilindru cu cheie", description: "Sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.KU10.812.12", name: "inox satinat" },
    ]},
  { code: "19.KU20.812", name: "Încuietoare centru US20 sticlă 10-12 mm", description: "Inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.KU20.812.12", name: "inox satinat" },
    ]},
  { code: "19.KG50.812", name: "Contrabroască sticlă GK50 sticlă 10-12 mm", description: "Inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p61_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.KG50.812.12", name: "inox satinat" },
    ]},
  // Balamale hidraulice
  { code: "13.8120.100", name: "Set balamă inferioară cu amortizor max 100 kg", description: "Include balamă PT20 și pivot", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p66_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "13.8120.100.12", name: "inox satinat" },
      { code: "13.8120.100.13", name: "vopsit negru mat" },
    ]},
  { code: "13.8120.000", name: "Balamă inferioară cu amortizor max 100 kg", description: "Testat 1.000.000 închideri/deschideri", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p66_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "13.8120.000.12", name: "inox satinat" },
      { code: "13.8120.000.15", name: "vopsit negru mat" },
    ]},
  { code: "801002", name: "Balamă hidraulică Biloba perete max 100 kg", description: "Sticlă 8-13.52 mm, Lmax ușă = 1000 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p66_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "801002", name: "alu. anod. argintiu mat" },
      { code: "801013", name: "efect inox satinat" },
      { code: "801005", name: "negru mat" },
    ]},
  { code: "801502", name: "Balamă hidraulică Biloba sticlă-sticlă max 80 kg", description: "Sticlă 8-13.52 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p66_1.jpg", supplier: "Qualmont", variants: [] },
  // Balamale cu revenire automată
  { code: "861002", name: "Balamă cu revenire automată perete max 60 kg", description: "Sticlă 8-12 mm, Lmax ușă 900 mm, testat 120.000 cicluri", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p67_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "861002", name: "alu. anod. argintiu mat" },
    ]},
  { code: "861102", name: "Balamă cu revenire automată sticlă-sticlă blocaj 0-90°", description: "Model 8611, testat 120.000 cicluri", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p67_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "861102", name: "alu. anod. argintiu mat" },
    ]},
  // Balamale ghișeu
  { code: "30.BH15.180", name: "Balamă ghișeu sticlă-sticlă 180°", description: "Max 30 kg, sticlă 6-10 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p67_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "30.BH15.180.31", name: "cromat lucios" },
      { code: "30.BH15.180.34", name: "cromat satinat" },
    ]},
  // Încuietori, zăvoare și opritori
  { code: "19.KU90.812", name: "Încuietoare pardoseală US90 cilindru cu cheie", description: "72x110x43 mm, sticlă 8-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p68_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.KU90.812.12", name: "inox satinat" },
    ]},
  { code: "19.PTBO.000", name: "Contraplacă îngropată cu arc bolt max 16 mm", description: "Pentru US10, US20, US90", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p68_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.PTBO.000.12", name: "inox satinat" },
    ]},
  { code: "US627SSS", name: "Încuietoare aplicată sticlă-perete cu rozetă", description: "Sticlă 10-12 mm, inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p68_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "19.8130.010", name: "Încuietoare aplicată cu cilindru inclus", description: "Sticlă 10 mm, montaj vertical", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p70_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.8130.010.12", name: "inox satinat" },
    ]},
  { code: "19.P510.810", name: "Încuietoare cu rozetă sticlă 8-10 mm", description: "Inox", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p70_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.P510.810.21", name: "inox lucios" },
    ]},
  { code: "19.F510.810", name: "Încuietoare cu rozetă sticlă 8-10 mm model F", description: "Inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p70_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.F510.810.12", name: "inox satinat" },
    ]},
  // Zăvoare și opritori
  { code: "19.DB40.810", name: "Zăvor cu bolt fără decupaj sticlă 8-10 mm", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p70_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "19.DB40.810.24", name: "alu. anod. argintiu mat" },
    ]},
  { code: "12.DS01.000", name: "Opritor rotund montaj pardoseală mic", description: "Inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p70_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "12.DS01.000.12", name: "inox satinat" },
    ]},
  { code: "12.DS02.000", name: "Opritor rotund montaj pardoseală mare", description: "Inox satinat sau negru mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p70_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "12.DS02.000.12", name: "inox satinat" },
      { code: "12.DS02.000.15", name: "negru mat" },
    ]},
  // Control acces
  { code: "E06E61000", name: "Încuietoare electronică E-LOCK EVO 2.0 dreapta", description: "Sticlă 8-12 mm, include 2 cartele, cheie și telecomandă, negru", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p71_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "E06E62000", name: "Încuietoare electronică E-LOCK EVO 2.0 stânga", description: "Sticlă 8-12 mm, include 2 cartele, cheie și telecomandă, negru", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p71_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "040702091", name: "Mâner C-Lever Compact Standalone", description: "Inox satinat, control acces", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p71_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "19860000", name: "Electromagnet aplicat EM 1800 AH", description: "Forță reținere 180 kg, cu monitorizare și LED de stare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p71_1.jpg", supplier: "Qualmont", variants: [] },
  // Amortizoare uși tâmplărie/sticlă
  { code: "66400101", name: "Amortizor TS68 EN 2/3/4 cu braț standard", description: "Argintiu", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p73_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "22212101", name: "Corp amortizor TS71 EN 3/4", description: "Argintiu", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p73_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "22002301", name: "Braț standard amortizor Dorma TS71/72/73/83", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p73_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "10200401", name: "Amortizor Dorma TS90 Impulse EN 3/4 cu șină", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p73_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "42020101", name: "Corp amortizor Dorma TS92B EN 1/4", description: "Argintiu", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p73_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "42000101", name: "Șină standard Dorma G-N TS92 sticlă 8-10 mm", description: "Argintiu", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p73_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "128885", name: "Corp amortizor TS2000V EN 2/4/5", description: "Argintiu", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p73_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "102789", name: "Corp amortizor Geze TS4000 EN 1/6", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p73_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== SISTEME UȘI GLISANTE (pag. 85-100) =====
  // Muto Comfort M60
  { code: "83700015099", name: "Set glisare Dorma Muto M60 V2 perete L=1900 mm", description: "1 ușă, max 60 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p77_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "83700115099", name: "Set glisare Dorma Muto M60 V2 perete L=2400 mm", description: "1 ușă, max 60 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p77_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "83700215099", name: "Set glisare Dorma Muto M60 V2 tavan L=1900 mm", description: "1 ușă, max 60 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p77_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "83700315099", name: "Set glisare Dorma Muto M60 V2 tavan L=2400 mm", description: "1 ușă, max 60 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p77_1.jpg", supplier: "Qualmont", variants: [] },
  // Muto Comfort L80
  { code: "83630015099", name: "Set glisare Dorma Muto L80 perete L=2180 mm", description: "Max 80 kg, sticlă 8-12 mm, Hmax 3000 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p78_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "83630115099", name: "Set glisare Dorma Muto L80 perete L=2880 mm", description: "Max 80 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p78_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "83630215099", name: "Set glisare Dorma Muto L80 tavan L=2180 mm", description: "Max 80 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p78_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "83630315099", name: "Set glisare Dorma Muto L80 tavan L=2880 mm", description: "Max 80 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p78_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "83630515099", name: "Set glisare Dorma Muto L80 sticlă L=2687 mm", description: "Max 80 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p78_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "83632315099", name: "Set glisare Dorma Muto L80 2 uși perete L=4360 mm", description: "Max 80 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p78_1.jpg", supplier: "Qualmont", variants: [] },
  // Muto Comfort XL150
  { code: "83651115099", name: "Set glisare Muto XL150 tavan L=2480 mm", description: "Max 150 kg, sticlă 8-12 mm, Hmax 3000 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p82_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "83651215099", name: "Set glisare Muto XL150 tavan L=2880 mm", description: "Max 150 kg, sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p82_1.jpg", supplier: "Qualmont", variants: [] },
  // Solo Vetro
  { code: "99.SSV1.200", name: "Set glisant Solo Vetro perete/tavan", description: "L=2 m, max 80 kg, sticlă 8-12 mm, amortizoare incluse", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p84_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "99.SSV1.200.24", name: "alu. anod. argintiu mat" },
    ]},
  { code: "99.SSV2.200", name: "Set glisant Solo Vetro cu parte fixă L=2 m", description: "Max 80 kg, sticlă 8-12 mm, amortizoare incluse", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p84_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "99.SSV2.200.24", name: "alu. anod. argintiu mat" },
      { code: "99.SSV2.200.23", name: "alu. anod. negru mat" },
    ]},
  { code: "99.SSV2.300", name: "Set glisant Solo Vetro cu parte fixă L=3 m", description: "Max 80 kg, sticlă 8-12 mm, amortizoare incluse", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p84_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "99.SSV2.300.24", name: "alu. anod. argintiu mat" },
      { code: "99.SSV2.300.23", name: "alu. anod. negru mat" },
    ]},
  { code: "17.2710.600", name: "Profil glisare Solo Vetro perete/tavan L=6000 mm", description: "Profil glisare", material_type: "hardware", unit: "lm", image_url: "/materials/img_p84_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "17.2710.600.24", name: "alu. anod. argintiu mat" },
      { code: "17.2710.600.27", name: "alu. anod. negru mat" },
    ]},
  { code: "17.2720.600", name: "Profil glisare Solo Vetro cu parte fixă L=6000 mm", description: "Profil glisare cu parte fixă", material_type: "hardware", unit: "lm", image_url: "/materials/img_p84_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "17.2720.600.24", name: "alu. anod. argintiu mat" },
      { code: "17.2720.600.27", name: "alu. anod. negru mat" },
    ]},
  { code: "17.2730.600", name: "Capac mascare Solo Vetro L=6000 mm", description: "Capac mascare", material_type: "hardware", unit: "lm", image_url: "/materials/img_p84_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "17.2730.600.24", name: "alu. anod. argintiu mat" },
      { code: "17.2730.600.27", name: "alu. anod. negru mat" },
    ]},
  // Vetro 40
  { code: "17.1280.600", name: "Profil glisare Vetro 40 tavan L=6000 mm", description: "Profil glisare tavan", material_type: "hardware", unit: "lm", image_url: "/materials/img_p86_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "17.1280.600.24", name: "alu. anod. argintiu mat" },
    ]},
  { code: "17.1750.600", name: "Profil glisare Vetro 40 Drag cu parte fixă L=6000 mm", description: "Montaj tavan", material_type: "hardware", unit: "lm", image_url: "/materials/img_p86_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "17.1750.600.24", name: "alu. anod. argintiu mat" },
    ]},
  { code: "17.1690.600", name: "Capac mascare Vetro 40 L=6000 mm", description: "Capac mascare profil", material_type: "hardware", unit: "lm", image_url: "/materials/img_p86_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "17.1690.600.24", name: "alu. anod. argintiu mat" },
    ]},
  { code: "17.1712.008", name: "Set cleme Vetro 40 sticlă 8 mm max 120 kg", description: "Set cleme fixare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p86_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "17.1712.008.99", name: "standard" },
    ]},
  { code: "17.1712.010", name: "Set cleme Vetro 40 sticlă 10 mm max 120 kg", description: "Set cleme fixare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p86_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "17.1712.010.99", name: "standard" },
    ]},
  // OPK Perfect System
  { code: "04-000-102-001", name: "Kit șină glisare Perfect System L=3000 mm", description: "Negru mat, cu capace", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p88_1.png", supplier: "Qualmont", variants: [] },
  { code: "04-000-102-002", name: "Kit șină glisare Perfect System L=6000 mm", description: "Negru mat, cu capace", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p88_1.png", supplier: "Qualmont", variants: [] },
  { code: "04-000-101-001", name: "Set accesorii Perfect System 1 ușă max 80 kg", description: "Amortizare inclusă", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p88_1.png", supplier: "Qualmont", variants: [] },
  { code: "04-010-100-101", name: "Mâner adeziv Perfect System Ø110 mm", description: "Negru mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p88_1.png", supplier: "Qualmont", variants: [] },
  { code: "04-010-100-104", name: "Mâner tip U Perfect System", description: "Negru mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p88_1.png", supplier: "Qualmont", variants: [] },
  // Magic 2 Vetro
  { code: "K.0041.2.02", name: "Set uși glisante Magic 2 Vetro max 1100 mm", description: "Sticlă 8-12 mm, max 80 kg, amortizare inclusă", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p89_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "K.0042.2.02", name: "Set uși glisante Magic 2 Vetro max 1800 mm", description: "Sticlă 8-12 mm, max 80 kg, amortizare inclusă", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p89_1.jpg", supplier: "Qualmont", variants: [] },
  // Magic 2 Frame
  { code: "K.0462.1.1.15", name: "Set glisare Magic 2 Frame 1100x2200 mm", description: "Sticlă 5-6 mm, max 80 kg, alu. anod. negru mat, amortizare inclusă", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p90_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "K.0461.1.1.15", name: "Set glisare Magic 2 Frame 1500x2200 mm", description: "Sticlă 5-6 mm, max 80 kg, alu. anod. negru mat, amortizare inclusă", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p90_1.jpg", supplier: "Qualmont", variants: [] },
  // Glisare telescopică
  { code: "LMV10012.300", name: "Set glisare ușă telescopică L=3000 mm 2 uși", description: "Max 100 kg, Hmax 3000 mm, sticlă 8-10 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p90_1.jpg", supplier: "Qualmont", variants: [] },
  // Încuietori uși glisante
  { code: "SERSD610S", name: "Încuietoare și contraplacă uși glisante", description: "Sticlă 10-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p82_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "SERSD610S/88", name: "efect inox satinat" },
      { code: "SERSD610S/97", name: "alu. anod. argintiu mat" },
    ]},
  { code: "SERSD620", name: "Contrabroască uși glisante", description: "Sticlă 10-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p82_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "SERSD620/88", name: "efect inox satinat" },
      { code: "SERSD620/97", name: "alu. anod. argintiu mat" },
    ]},
  // Vetro Drag
  { code: "K.0341.8.1", name: "Set cărucioare Vetro 40 Drag panou A", description: "Min 700 mm, sticlă 8-10 mm, max 80 kg, dublă amortizare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p86_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "K.0342.8.1", name: "Set cărucioare Vetro 40 Drag panou B", description: "Min 700 mm, sticlă 8-10 mm, max 80 kg, dublă amortizare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p86_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "K.0343.8.1", name: "Set cărucioare Vetro 40 Drag panou C", description: "Min 700 mm, sticlă 8-10 mm, max 80 kg, dublă amortizare", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p86_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== GLISARE TELESCOPICĂ (pag. 101-103) =====
  { code: "LMV10012F.300", name: "Set glisare telescopică L=3000 mm 2 uși + parte fixă", description: "Max 100 kg, Hmax 3000 mm, sticlă 8-10 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p91_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LMV10013.400", name: "Set glisare telescopică L=4000 mm 3 uși", description: "Max 100 kg, Hmax 3000 mm, sticlă 8-10 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p91_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LMV10013F.400", name: "Set glisare telescopică L=4000 mm 3 uși + parte fixă", description: "Max 100 kg, Hmax 3000 mm, sticlă 8-10 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p91_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "042.3102.072", name: "Amortizor unilateral sistem telescopic 20/60 kg", description: "Min 320 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p91_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "042.3102.071", name: "Amortizor unilateral sistem telescopic 60/100 kg", description: "Min 570 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p91_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== MÂNERE TRĂGĂTOARE H (pag. 105) =====
  { code: "50.5325.020", name: "Mâner trăgător H Ø25 mm interax 200 mm", description: "Gaură sticlă 12 mm, L=300 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5325.020.12", name: "inox satinat" },
      { code: "50.5325.020.13", name: "inox vopsit RAL 9005 mat" },
    ]},
  { code: "50.5325.030", name: "Mâner trăgător H Ø25 mm interax 300 mm", description: "L=500 mm, gaură sticlă 12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5325.030.12", name: "inox satinat" },
    ]},
  { code: "50.5325.035", name: "Mâner trăgător H Ø25 mm interax 350 mm", description: "L=500 mm, gaură sticlă 12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5325.035.12", name: "inox satinat" },
      { code: "50.5325.035.11", name: "inox lucios" },
      { code: "50.5325.035.13", name: "inox vopsit RAL 9005 mat" },
      { code: "50.5325.035.37", name: "alamă satinată" },
    ]},
  { code: "50.5325.050", name: "Mâner trăgător H Ø25 mm interax 500 mm", description: "L=700 mm, gaură sticlă 12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5325.050.12", name: "inox satinat" },
    ]},
  { code: "50.5325.060", name: "Mâner trăgător H Ø25 mm interax 600 mm", description: "L=1000 mm, gaură sticlă 12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5325.060.12", name: "inox satinat" },
    ]},
  { code: "50.5325.080", name: "Mâner trăgător H Ø25 mm interax 800 mm", description: "L=1000 mm, gaură sticlă 12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5325.080.12", name: "inox satinat" },
    ]},
  { code: "50.5325.360", name: "Mâner trăgător H Ø25 mm 3 prinderi interax 600 mm", description: "L=1500 mm, gaură sticlă 12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5325.360.12", name: "inox satinat" },
    ]},
  { code: "50.5330.381", name: "Mâner trăgător H Ø30 mm 3 prinderi interax 815 mm", description: "L=1800 mm, gaură sticlă 12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5330.381.12", name: "inox satinat" },
    ]},
  { code: "50.5441.030", name: "Mâner trăgător H rectangular 40x10 mm interax 300 mm", description: "L=450 mm, gaură sticlă 12-14 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5441.030.12", name: "inox satinat" },
    ]},
  { code: "50.5441.045", name: "Mâner trăgător H rectangular 40x10 mm interax 450 mm", description: "L=600 mm, gaură sticlă 12-14 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p92_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.5441.045.12", name: "inox satinat" },
    ]},

  // Mânere C suplimentare (pag. 106)
  { code: "50.KSQB.045", name: "Mâner trăgător C 25x25 mm interax 450 mm", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p93_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.KSQB.045.12", name: "inox satinat" },
    ]},
  { code: "50.KSRA.219", name: "Mâner trăgător C Ø19 mm interax 200 mm", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p93_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.KSRA.219.12", name: "inox satinat" },
    ]},
  { code: "47.5100.300", name: "Mâner trăgător C Ø25.4 mm interax 300 mm", description: "Sticlă 6-12 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p93_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "47.5100.300.12", name: "inox satinat" },
    ]},
  { code: "50.5325.035.72", name: "Mâner H dublu lemn fag interax 350 mm", description: "Ø25 mm, H500 mm, fag lăcuit natur", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p93_2.jpg", supplier: "Qualmont", variants: [] },
  { code: "47.0203.025", name: "Mâner tip H cu închidere pardoseală Ø25.4 mm", description: "L=1250 mm, sticlă 8-12 mm, inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p93_3.jpg", supplier: "Qualmont",
    variants: [
      { code: "47.0203.025.12", name: "inox satinat" },
    ]},

  // Mânere scoică suplimentare (pag. 107)
  { code: "IN16527", name: "Mâner scoică Ø65 mm auto-adeziv", description: "Necesar 2 buc/ușă, inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p93_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "51.FH65.812", name: "Mâner scoică Ø65 mm gaură Ø20 mm", description: "Sticlă 8-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p93_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "51.FH65.812.24", name: "alu. anod. argintiu mat" },
    ]},

  // Mânere uși tâmplărie/sticlă (pag. 108)
  { code: "50.14K9.060", name: "Mâner trăgător dublu pătrat 35x35 mm interax 600 mm", description: "L=800 mm, inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.14K9.060.12", name: "inox satinat" },
    ]},
  { code: "50.14S4.050", name: "Mâner trăgător dublu Ø32 mm fixare 45° interax 300 mm", description: "L=500 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.14S4.050.12", name: "inox satinat" },
    ]},
  { code: "50.14S4.065", name: "Mâner trăgător dublu Ø32 mm fixare 45° interax 450 mm", description: "L=650 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.14S4.065.12", name: "inox satinat" },
    ]},
  { code: "50.14S4.080", name: "Mâner trăgător dublu Ø32 mm fixare 45° interax 600 mm", description: "L=800 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.14S4.080.12", name: "inox satinat" },
    ]},
  { code: "50.14S4.100", name: "Mâner trăgător dublu Ø32 mm fixare 45° interax 800 mm", description: "L=1000 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.14S4.100.12", name: "inox satinat" },
    ]},
  { code: "50.14S4.180", name: "Mâner trăgător dublu Ø32 mm fixare 45° interax 1300 mm", description: "L=1800 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.14S4.180.12", name: "inox satinat" },
    ]},
  { code: "50.04S4.050", name: "Mâner trăgător o parte Ø32 mm fixare 45° interax 300 mm", description: "L=500 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.04S4.050.12", name: "inox satinat" },
    ]},
  { code: "50.04S4.100", name: "Mâner trăgător o parte Ø32 mm fixare 45° interax 800 mm", description: "L=1000 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_2.jpg", supplier: "Qualmont",
    variants: [
      { code: "50.04S4.100.12", name: "inox satinat" },
    ]},
  { code: "54.1040.045.00", name: "Set fixare mâner pe ușă PVC/aluminiu L=45 mm", description: "O parte, Ø10", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "54.1040.045.99", name: "Set montaj mâner cu buton pe tâmplărie", description: "O parte, fixare pe tâmplărie", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p94_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== PROFILE BALUSTRADĂ VIEW CRYSTAL (pag. 110-115) =====
  { code: "56.8596.610", name: "Profil U balustradă View Crystal 2.0, 1kN", description: "L=6100 mm, fixare pardoseală", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.8596.610.26", name: "alu. anod. argintiu periat" },
    ]},
  { code: "56.8597.610", name: "Profil U balustradă View Crystal 2.0 cu drenaj, 1kN", description: "L=6100 mm, fixare pardoseală", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.8597.610.26", name: "alu. anod. argintiu periat" },
    ]},
  { code: "56.8588.610", name: "Profil F balustradă View Crystal 2.0, 1kN", description: "L=6100 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.8588.610.26", name: "alu. anod. argintiu periat" },
    ]},
  { code: "56.8553.610", name: "Profil U balustradă View Crystal fixare pardoseală, 1kN", description: "L=6100 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.8553.610.20", name: "alu. nefinisat" },
      { code: "56.8553.610.26", name: "alu. anod. argintiu periat" },
      { code: "56.8553.610.27", name: "vopsit RAL 9011 mat" },
      { code: "56.8553.610.28", name: "vopsit RAL 7016 mat" },
    ]},
  { code: "56.8558.610", name: "Profil U View Crystal fixare pardoseală cu drenaj, 1kN", description: "L=6100 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.8558.610.26", name: "alu. anod. argintiu periat" },
    ]},
  { code: "56.8569.610", name: "Profil drenaj View Crystal 8553/8596", description: "L=6100 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.8569.610.26", name: "alu. anod. argintiu periat" },
    ]},
  { code: "65.4555.000", name: "Capac capăt profil View Crystal", description: "Compatibil 8553, 8558, 8596, 8597", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "65.4555.000.23", name: "alu. argintiu deschis" },
    ]},
  { code: "56.8552.610", name: "Profil U balustradă View Crystal fixare laterală, 1kN", description: "L=6100 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.8552.610.20", name: "alu. nefinisat" },
      { code: "56.8552.610.26", name: "alu. anod. argintiu periat" },
    ]},
  { code: "65.8551.610", name: "Capac lateral profil U View Crystal 8552", description: "L=6100 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "65.8551.610.26", name: "alu. anod. argintiu periat" },
    ]},
  { code: "56.8556.610", name: "Profil F View Crystal fixare pardoseală, 3kN", description: "L=6100 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.8556.610.20", name: "alu. nefinisat" },
      { code: "56.8556.610.26", name: "alu. anod. argintiu periat" },
    ]},
  { code: "56.8591.610", name: "Profil U balustradă 8591 fixare pardoseală", description: "L=6100 mm, H=85 mm, sticlă 12.76/16.76 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.8591.610.26", name: "alu. anod. argintiu periat" },
    ]},
  // Garnituri View Crystal
  { code: "73.8503.012", name: "Garnitură contact interioară View Crystal sticlă 12 mm", description: "Cauciuc negru", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "73.8502.016", name: "Garnitură contact interioară View Crystal sticlă 16 mm", description: "Cauciuc negru", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "73.8510.012", name: "Pană profil View Crystal sticlă 12.76 mm", description: "Plastic negru, 4 buc/m", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "74.8595.000", name: "Bolt aliniere profil balustradă View Crystal", description: "Inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p95_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "74.8595.000.12", name: "inox satinat" },
    ]},

  // ===== PROFILE BALUSTRADĂ LUX (pag. 116-120) =====
  { code: "56.1827.600", name: "Profil U balustradă 18.20 Lux, 1kN", description: "L=6000 mm, H=110 mm, sticlă max 1100 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p96_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.1827.600.20", name: "alu. natur" },
      { code: "56.1827.600.25", name: "efect inox mat" },
    ]},
  { code: "65.9547.000", name: "Capac capăt profil 18.20 Lux", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p96_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "65.9547.000.12", name: "inox satinat 304" },
    ]},
  { code: "99.1820.016", name: "Set cale, pene și garnituri profil 18.20 Lux sticlă 16.76 mm", description: "3 cale/m, 3 pene/m, garnitură ext./int.", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p96_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "99.1820.020", name: "Set cale, pene și garnituri profil 18.20 Lux sticlă 20.76 mm", description: "3 cale/m, 3 pene/m, garnitură ext./int.", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p96_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "56.1865.600", name: "Profil U balustradă 18.60 Lux", description: "L=6000 mm, H=90 mm, sticlă max 900 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p96_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "56.1865.600.20", name: "alu. natur" },
      { code: "56.1865.600.25", name: "efect inox mat" },
    ]},
  { code: "65.9569.000", name: "Capac capăt profil 18.60 Lux", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p96_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "65.9569.000.12", name: "inox satinat 304" },
    ]},
  { code: "18.01.65.08", name: "Profil U balustradă 18.01", description: "L=6000 mm, H=65 mm, Hmax 650 mm, efect inox mat", material_type: "hardware", unit: "lm", image_url: "/materials/img_p96_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "140283", name: "Balamă portiță balustradă sticlă-sticlă 180°", description: "Sticlă 6-12.76 mm, max 45 kg, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p96_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "140284", name: "Încuietoare portiță balustradă MOD 0282", description: "Sticlă 6-12.76 mm, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p96_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== PRINDERI PUNCTUALE (pag. 122-129) =====
  { code: "21.7501.000", name: "Conector PICO sticlă 6-8 mm negru", description: "Ø17 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "21.7501.000.99", name: "negru" },
    ]},
  { code: "21.7502.000", name: "Conector PICO sticlă 6-8 mm transparent", description: "Ø17 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "21.7502.000.99", name: "transparent" },
    ]},
  { code: "21.7511.000", name: "Conector PICO sticlă 10-12 mm negru", description: "Ø17 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "21.7511.000.99", name: "negru" },
    ]},
  { code: "21.7301.000", name: "Capac mascare conector PICO", description: "Efect inox satinat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "21.7301.000.32", name: "efect inox satinat" },
    ]},
  { code: "21.2071.000", name: "Conector punctual Ø25 mm sticlă 6 mm", description: "Holșurub Ø6 mm, inox lucios 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "21.2071.000.99", name: "inox lucios 304" },
    ]},
  { code: "21.2072.000", name: "Conector punctual Ø25 mm sticlă 8-10 mm", description: "Holșurub Ø6 mm, inox lucios 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "21.2072.000.99", name: "inox lucios 304" },
    ]},
  { code: "21.2001.K20", name: "Conector punctual Ø20x12 mm tijă M6 sticlă 6-16 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "21.2001.K20.12", name: "inox satinat 304" },
    ]},
  { code: "57.0746.015", name: "Conector punctual Ø30 mm distanțier 15 mm", description: "M8, sticlă 6-12.76 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "57.0746.015.12", name: "inox satinat 304" },
    ]},
  { code: "57.0764.010", name: "Conector punctual Ø40 mm M10 distanțier 10 mm", description: "Sticlă 8-17.52 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "57.0764.010.12", name: "inox satinat 304" },
    ]},
  { code: "57.0747.010", name: "Conector punctual Ø50 mm M10 distanțier 10 mm", description: "Sticlă 8-18 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "57.0747.010.12", name: "inox satinat 304" },
    ]},
  { code: "57.0747.030", name: "Conector punctual Ø50 mm M10 distanțier 30 mm", description: "Sticlă 8-17.52 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p97_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "57.0747.030.12", name: "inox satinat 304" },
    ]},

  // Spigots (pag. 126-127)
  { code: "64.6100.00B", name: "Spigot Ø48 mm H=182 mm sticlă 12-17.52 mm", description: "Fără găurire, inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "64.6100.00B.12", name: "inox satinat 304" },
    ]},
  { code: "64.6200.00C", name: "Spigot 50x50 mm H=182 mm sticlă 12-17.52 mm", description: "Fără găurire", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "64.6200.00C.12", name: "inox satinat 304" },
      { code: "64.6200.00C.23", name: "negru mat" },
      { code: "64.6200.000.14", name: "inox satinat 316" },
    ]},
  { code: "65.4511.B50", name: "Capac mascare talpă fixare spigot 50x50 mm", description: "108x108/50x50/20 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "65.4511.B50.14", name: "inox satinat 316" },
      { code: "65.4511.B50.27", name: "negru mat" },
    ]},
  { code: "64.6220.014", name: "Spigot 45x50 mm H=160 mm sticlă 12-13.5 mm", description: "Fără găurire, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "64.6220.014.14", name: "inox satinat 316" },
    ]},
  { code: "146000-12", name: "Spigot balustradă MOD 6000 sticlă 12-17.52 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont", variants: [] },

  // Conectori aliniere (pag. 128-129)
  { code: "63.7641.040", name: "Conector aliniere sticlă Ø40 mm M5", description: "Sticlă maxim 17.52 mm, inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "63.7641.040.12", name: "inox satinat 304" },
    ]},
  { code: "63.0592.090", name: "Colțar aliniere sticlă 81x81x40 mm sticlă 12.76 mm", description: "Fără găurire, inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "63.0592.090.12", name: "inox satinat 304" },
    ]},
  { code: "63.0771.015", name: "Conector aliniere sticlă-perete 90° sticlă 12-15 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "63.0771.015.14", name: "inox satinat 316" },
    ]},
  { code: "63.0773.015", name: "Conector aliniere sticlă-sticlă 90° sticlă 12-15 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "63.0773.015.14", name: "inox satinat 316" },
    ]},
  { code: "63.0772.015", name: "Conector aliniere sticlă-sticlă 180° sticlă 12-15 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p98_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "63.0772.015.14", name: "inox satinat 316" },
    ]},

  // ===== MÂNĂ CURENTĂ APLICATĂ (pag. 130-134) =====
  { code: "58.8585.610", name: "Mână curentă profilată Ø42.4 mm alu. L=6100 mm", description: "Alu. anod. argintiu periat", material_type: "hardware", unit: "lm", image_url: "/materials/img_p99_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "58.8585.610.26", name: "alu. anod. argintiu periat" },
    ]},
  { code: "71.5042.208", name: "Garnitură U 24x24 mm mână curentă Ø42.4 mm sticlă 8-11 mm", description: "L=5000 mm, EPDM negru", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p99_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "71.8511.012", name: "Garnitură U 24x24 mm mână curentă sticlă 12.76 mm", description: "EPDM negru", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p99_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "71.8512.016", name: "Garnitură U 24x24 mm mână curentă sticlă 16.76 mm", description: "EPDM negru", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p99_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "58.6920.042", name: "Mână curentă profilată Ø42.4x1.5 mm inox L=5000 mm", description: "U 24x24 mm, inox satinat 304", material_type: "hardware", unit: "lm", image_url: "/materials/img_p99_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "58.6920.042.12", name: "inox satinat 304" },
    ]},
  { code: "58.6732.042", name: "Capac capăt drept mână curentă Ø42.4x1.5 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p99_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "58.6732.042.12", name: "inox satinat 304" },
    ]},
  { code: "58.6790.042", name: "Conector 180° mână curentă Ø42.4x1.5 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p99_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "58.6790.042.12", name: "inox satinat 304" },
    ]},
  { code: "58.6313.042", name: "Cot 90° orizontal mână curentă Ø42.4x1.5 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p99_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "58.6313.042.12", name: "inox satinat 304" },
    ]},
  { code: "58.6505.042", name: "Flanșă perete Ø90 mm mână curentă Ø42.4x1.5 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p99_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "58.6505.042.14", name: "inox satinat 316" },
    ]},

  // Mână curentă pătrată (pag. 133)
  { code: "58.6920.040", name: "Mână curentă profilată 40x40 mm inox L=5000 mm", description: "U 24x24 mm, inox satinat 304", material_type: "hardware", unit: "lm", image_url: "/materials/img_p100_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "58.6920.040.12", name: "inox satinat 304" },
    ]},
  { code: "65.6732.040", name: "Capac mână curentă 40x40x1.5 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p100_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "65.6732.040.12", name: "inox satinat 304" },
    ]},
  { code: "58.6505.040", name: "Flanșă prindere perete mână curentă 40x40 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p100_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "58.6505.040.14", name: "inox satinat 316" },
    ]},

  // Mână curentă U cu garnitură (pag. 134)
  { code: "58.1225.600", name: "Profil U mână curentă 30x28x30x2 mm L=6000 mm", description: "Sticlă 16.76 mm, alu. efect inox mat", material_type: "hardware", unit: "lm", image_url: "/materials/img_p100_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "58.1225.600.25", name: "alu. efect inox mat" },
    ]},

  // ===== ȚEAVĂ MÂNĂ CURENTĂ KAAK (pag. 135-141) =====
  { code: "37.SS3H.042", name: "Mână curentă rotundă KAAK Ø42.4 mm", description: "Fixare pe sticlă, set complet cu suporți", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p101_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "37.SS3H.042.11", name: "inox lucios" },
      { code: "37.SS3H.042.12", name: "inox satinat" },
    ]},
  { code: "37.SS3H.050", name: "Mână curentă rotundă KAAK Ø50 mm", description: "Fixare pe sticlă, set complet cu suporți", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p101_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "37.SS3H.050.11", name: "inox lucios" },
      { code: "37.SS3H.050.12", name: "inox satinat" },
    ]},
  { code: "72.TR42.100", name: "Țeavă Ø42.4x2 mm tăiată la metru", description: "Inox satinat 304", material_type: "hardware", unit: "lm", image_url: "/materials/img_p102_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "72.TR42.100.12", name: "inox satinat 304" },
    ]},
  { code: "72.TR42.600", name: "Țeavă Ø42.4x2 mm L=6000 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p102_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "72.TR42.600.12", name: "inox satinat 304" },
    ]},
  { code: "65.5729.242", name: "Capac capăt bombat țeavă Ø42.4x2 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p102_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "65.5729.242.12", name: "inox satinat 304" },
    ]},
  { code: "59.0790.242", name: "Conector îmbinare 180° țeavă Ø42.4x2 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p102_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "59.0790.242.12", name: "inox satinat 304" },
    ]},
  { code: "59.0302.242", name: "Cot reglabil 0°-90° țeavă Ø42.4x2 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p102_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "59.0302.242.12", name: "inox satinat 304" },
    ]},
  { code: "59.0504.242", name: "Flanșă perete Ø50 mm țeavă Ø42.4x2 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p103_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "59.0504.242.12", name: "inox satinat 304" },
    ]},
  { code: "130117-042", name: "Suport mână curentă MOD 0117 fixare sticlă Ø42.4 mm", description: "Sticlă 8-25.52 mm, inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p103_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "130117-042-12", name: "inox satinat 304" },
    ]},

  // Țeavă rectangulară 40x40 (pag. 139)
  { code: "72.D4040.600", name: "Țeavă 40x40x2 mm L=6000 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p103_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "72.D4040.600.12", name: "inox satinat 304" },
    ]},
  { code: "59.4505.040", name: "Flanșă perete 95x95 mm țeavă 40x40x2 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p103_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "59.4505.040.12", name: "inox satinat 304" },
    ]},
  { code: "65.4732.040", name: "Capac capăt drept 40x40 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p103_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "65.4732.040.12", name: "inox satinat 304" },
    ]},

  // Țeavă 40x10 MOD 4900 (pag. 140)
  { code: "134900-041-25", name: "Țeavă 40x10x1.5 mm MOD 4900 L=2500 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p103_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "134900-041-25-12", name: "inox satinat 304" },
    ]},
  { code: "134900-041-50", name: "Țeavă 40x10x1.5 mm MOD 4900 L=5000 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p103_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "134900-041-50-12", name: "inox satinat 304" },
    ]},

  // Mână curentă lemn (pag. 142)
  { code: "79.D420.200", name: "Mână curentă lemn Ø42 mm L=2000 mm", description: "Fag natur", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p104_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "79.D420.200.70", name: "fag natur" },
    ]},
  { code: "79.D420.250", name: "Mână curentă lemn Ø42 mm L=2500 mm", description: "Fag natur", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p104_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "79.D420.250.70", name: "fag natur" },
    ]},
  { code: "79.D420.300", name: "Mână curentă lemn Ø42 mm L=3000 mm", description: "Fag natur", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p104_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "79.D420.300.70", name: "fag natur" },
    ]},
  { code: "79.4040.200", name: "Mână curentă lemn 40x40 mm L=2000 mm", description: "Fag natur", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p104_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "79.4040.200.70", name: "fag natur" },
    ]},

  // ===== MONTANȚI ȘI CLEME BALUSTRADĂ (pag. 143-145) =====
  { code: "60.2001.700", name: "Montant rotund Ø42.4 mm H=700 mm sticlă 6-12.76 mm", description: "Țeavă rotundă, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p101_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "60.2001.700.14", name: "inox satinat 316" },
    ]},
  { code: "60.2110.700", name: "Montant rectangular H=700 mm sticlă 6-12.76 mm", description: "Țeavă rectangulară, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p101_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "60.2110.700.14", name: "inox satinat 316" },
    ]},

  // ===== SISTEME BALCON FRANȚUZESC (pag. 147-148) =====
  { code: "166839-011-00-18", name: "Balcon franțuzesc Easy Glass View MOD 6839 set", description: "Profile și capace, L=2x1100 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p106_1.png", supplier: "Qualmont", variants: [] },
  { code: "166830-050-00-18", name: "Profil Easy Glass View MOD 6830 perete L=5000 mm", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "lm", image_url: "/materials/img_p106_1.png", supplier: "Qualmont", variants: [] },
  { code: "62.8540.100", name: "Profil balcon franțuzesc Juliet Balcony tăiat la metru", description: "L=6500 mm", material_type: "hardware", unit: "lm", image_url: "/materials/img_p107_1.jpg", supplier: "Qualmont",
    variants: [
      { code: "62.8540.100.20", name: "alu. nefinisat" },
      { code: "62.8540.650.28", name: "vopsit RAL 7016 mat" },
    ]},

  // ===== ACCESORII MONTAJ BALUSTRADE (pag. 149) =====
  { code: "201001", name: "Dispozitiv montaj pene și garnituri MOD 6922", description: "Pentru profile balustradă", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p108_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "75.DRIL.0M5", name: "Burghiu cu tarod pentru inox HSS cobalt M5", description: "HSS cobalt", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p108_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "75.DRIL.0M6", name: "Burghiu cu tarod pentru inox HSS cobalt M6", description: "HSS cobalt", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p108_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "75.DRIL.0M8", name: "Burghiu cu tarod pentru inox HSS cobalt M8", description: "HSS cobalt", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p108_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "19.1330.000", name: "Adeziv lipire inox Extra-Lock 50g", description: "Lipire rapidă inox", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p108_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "200610", name: "Soluție curățare inox Ultra Clean 500 ml", description: "MOD 0610, curățare și întreținere", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p108_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== COPERTINE CU TIRANT (pag. 151-153) =====
  { code: "99.PRR3.100.14", name: "Kit copertină cu tirant adâncime max 1000 mm", description: "Sticlă 8.76-17.52 mm, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p151_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "99.PRR0.100.14", name: "Kit copertină cu tirant adâncime max 1000 mm", description: "Sticlă 12.76-17.52 mm, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p151_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.P704.M12.14", name: "Conector copertină perete-tirant M12", description: "Ø20, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p151_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.P704.060.14", name: "Conector copertină perete-sticlă 8.76-17.52 mm", description: "Ø58, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p152_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.P600.M12.14", name: "Conector copertină tirant M12-sticlă 8.76-17.52 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p152_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.P120.00R.14", name: "Conector copertină perete-tirant M12 Ø120 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p152_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.P120.070.14", name: "Conector copertină perete-sticlă 12.76-17.52 mm Ø120 mm", description: "2xM10, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p152_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.P70R.M12.14", name: "Conector copertină tirant M12-sticlă 12.76-17.52 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p152_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.PR12.100.14", name: "Tirant copertină Ø12 mm L=1000 mm", description: "Filet M12x30 mm, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p152_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.PR12.125.14", name: "Tirant copertină Ø12 mm L=1250 mm", description: "Filet M12x30 mm, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p152_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.PR12.150.14", name: "Tirant copertină Ø12 mm L=1500 mm", description: "Filet M12x30 mm, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p152_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.9040.000.12", name: "Conector copertină cu talpă 160x50 mm perete-tijă M12", description: "Filet drept M12, inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.9050.080.12", name: "Conector copertină Ø80 mm cu placă perete-sticlă 21.52-25.52 mm", description: "Tijă M12, inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.9033.080.12", name: "Conector copertină Ø80 mm tijă-sticlă 21.52-25.52 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.9012.080.12", name: "Conector dublu copertină Ø80 mm tijă-sticlă 21.52-25.52 mm", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.KDSZ.12F.12", name: "Tirant copertină Ø12 mm L=1056 mm filet M12", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.KDSZ.12E.12", name: "Tirant copertină Ø12 mm L=1130 mm filet M12", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.KDSZ.12D.12", name: "Tirant copertină Ø12 mm L=1208 mm filet M12", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.KDSZ.12C.12", name: "Tirant copertină Ø12 mm L=1285 mm filet M12", description: "Inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.KDSZ.12B.12", name: "Tirant copertină Ø12 mm L=1363 mm filet M12", description: "Max. 2000 mm cu 2 tiranți, inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "66.KDSZ.12A.12", name: "Tirant copertină Ø12 mm L=1442 mm filet M12", description: "Max. 3300 mm cu 3 tiranți, inox satinat 304", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p153_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== COPERTINE CU BRAȚ (pag. 154) =====
  { code: "67.KDS2.750.14", name: "Copertină tip marchiză set 2 brațe L=750 mm", description: "Adâncime max 1000 mm, sticlă 16.76-21.52 mm, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p154_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "67.KDS3.750.14", name: "Copertină tip marchiză set 3 brațe L=750 mm", description: "Adâncime max 1000 mm, sticlă 16.76-21.52 mm, inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p154_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== COPERTINE PROFIL ÎNCASTRAT (pag. 155) =====
  { code: "LM-K150-16A", name: "Set profil copertină Linea Mini 3 L=1500 mm", description: "Sticlă 16.76-17.52 mm, adâncime max 1200 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LM-K200-Z16A", name: "Set profil copertină Linea Mini 3 L=2000 mm", description: "Sticlă 16.76-17.52 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LM-K300-Z16A", name: "Set profil copertină Linea Mini 3 L=3000 mm", description: "Sticlă 16.76-17.52 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LM-K400-Z16A", name: "Set profil copertină Linea Mini 3 L=4000 mm", description: "Sticlă 16.76-17.52 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LM-K600-Z16A", name: "Set profil copertină Linea Mini 3 L=6000 mm", description: "Sticlă 16.76-17.52 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LM-6ADX", name: "Capac lateral dreapta Linea Mini 3", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LM-6ASX", name: "Capac lateral stânga Linea Mini 3", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LM-AS", name: "Kit accesorii sticlă antialunecare Linea Mini 3", description: "Elimină necesitatea găuririi sticlei", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LX-K150-Z20A", name: "Set profil copertină Linea Maxi 3 L=1500 mm", description: "Sticlă 21.52-25.52 mm, adâncime max 1500 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LX-K200-Z20A", name: "Set profil copertină Linea Maxi 3 L=2000 mm", description: "Sticlă 21.52-25.52 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LX-6ADX", name: "Capac lateral dreapta Linea Maxi 3", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LX-6ASX", name: "Capac lateral stânga Linea Maxi 3", description: "Alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "LX-AS", name: "Kit accesorii sticlă antialunecare Linea Maxi 3", description: "Elimină necesitatea găuririi sticlei", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "PC51.000.2200.TRTR", name: "Garnitură etanșare copertină L=2200 mm", description: "Luft 5-7 mm, sticlă 10.76-21.52 mm, PVC transparent", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p155_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== PROFILE PRESOARE ȘI ACCESORII (pag. 156) =====
  { code: "KFD-K5346", name: "Capac profil presor 52.5x17.7 mm L=6000 mm", description: "Aluminiu argintiu mat", material_type: "hardware", unit: "lm", image_url: "/materials/img_p156_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "KFD-F5046", name: "Profil presor 50x7.4 mm L=6000 mm", description: "Aluminiu argintiu mat", material_type: "hardware", unit: "lm", image_url: "/materials/img_p156_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "KFD-AUFLAGE 50", name: "Garnitură suport sistem presor L=30 m", description: "Pentru profil presor 53-18", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p156_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "KFD-DICHTUNG", name: "Garnitură sigilare sistem presor L=60 m", description: "Pentru profil presor 53-18", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p156_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "K-END10", name: "Distanțier profil presor 6x10 mm L=2800 mm", description: "Pentru profil presor", material_type: "consumable", unit: "pcs", image_url: "/materials/img_p156_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "KFD-KAPPE 50/7", name: "Capac de capăt pentru profil presor 50", description: "Profil presor 53-18", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p156_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "KFD-KAPPE 53/18", name: "Capac de capăt pentru profil presor 53", description: "Profil presor 53-18", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p156_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== SPIDERI ȘI RODANE (pag. 157-160) =====
  { code: "SP2201/15", name: "Spider 4 brațe interax 110 mm", description: "Inox lucios 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p157_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "SP2202/15", name: "Spider 2 brațe la 180° interax 110 mm", description: "Inox lucios 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p157_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "SP2203/15", name: "Spider 2 brațe la 90° interax 110 mm", description: "Inox lucios 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p157_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "SP2204/15", name: "Spider 1 braț la 180° interax 110 mm", description: "Inox lucios 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p157_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "SP2205/15", name: "Spider 1 braț la 45° interax 110 mm", description: "Inox lucios 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p157_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "SP2206/15", name: "Spider 3 brațe interax 110 mm", description: "Inox lucios 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p157_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "SP220Z/9", name: "Conector spider zincat cu șurub", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p160_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "SP220Z04", name: "Șurub fixare spider M18x48 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p160_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "69.ROT2.000.12", name: "Rodan articulat Ø59 x M14 sticlă 13-28 mm", description: "Inox satinat 316", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p160_1.jpg", supplier: "Qualmont", variants: [] },

  // ===== SISTEME ÎNCHIDERE TERASE ȘI BALCOANE (pag. 162-163) =====
  { code: "18.MW72.010.24", name: "Sistem perete amovibil MW72 cu parcare", description: "Max 150 kg, H max 3500 mm, l max panou 1200 mm, sticlă 10-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p162_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "18.MW52.010.24", name: "Sistem perete amovibil MW52 cu parcare", description: "Max 100 kg, H max 3000 mm, l max panou 1000 mm, sticlă 10-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p162_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "18.FW72.010.24", name: "Sistem perete armonic FW72", description: "Max 80 kg, H max 3000 mm, panou capăt 800 mm, intermediar 1000 mm, sticlă 10-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p162_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "18.FW52.010.24", name: "Sistem perete armonic FW52", description: "Max 70 kg, H max 3000 mm, panou capăt 800 mm, intermediar 1000 mm, sticlă 10-12 mm, alu. anod. argintiu mat", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p162_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "SGONE", name: "Sistem multiglisant See Glass One", description: "Sticlă 8-10 mm, lungime configurabilă, standard alb / RAL, H max 3000 mm", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p163_1.jpg", supplier: "Qualmont", variants: [] },
  { code: "SGRUN", name: "Sistem multiglisant See Glass RUN 3", description: "Sticlă 10 mm, 3-6 căi de rulare, L max panou 1500 mm, H max 3000 mm, max 140 kg, standard alb / RAL", material_type: "hardware", unit: "pcs", image_url: "/materials/img_p163_1.jpg", supplier: "Qualmont", variants: [] },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Authenticate and authorize: admin only
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Verify JWT using anon client with user's token
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role using service role client
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleData?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let materialsInserted = 0;
    let variantsInserted = 0;
    const errors: string[] = [];

    for (const mat of MATERIALS) {
      const { variants, ...materialData } = mat;

      // Upsert material by code
      const { data: inserted, error: matErr } = await supabase
        .from('materials')
        .upsert({
          code: materialData.code,
          name: materialData.name,
          description: materialData.description,
          material_type: materialData.material_type,
          unit: materialData.unit,
          image_url: materialData.image_url,
          supplier: materialData.supplier,
          is_active: true,
        }, { onConflict: 'code' })
        .select('id')
        .single();

      if (matErr) {
        errors.push(`Material ${materialData.code}: ${matErr.message}`);
        continue;
      }

      materialsInserted++;
      const materialId = inserted.id;

      // Upsert variants
      if (variants && variants.length > 0) {
        for (const v of variants) {
          const { error: varErr } = await supabase
            .from('material_variants')
            .upsert({
              material_id: materialId,
              variant_code: v.code,
              variant_name: v.name,
              is_active: true,
            }, { onConflict: 'variant_code' });

          if (varErr) {
            errors.push(`Variant ${v.code}: ${varErr.message}`);
          } else {
            variantsInserted++;
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      materials_inserted: materialsInserted,
      variants_inserted: variantsInserted,
      total_materials: MATERIALS.length,
      total_variants: MATERIALS.reduce((sum, m) => sum + (m.variants?.length || 0), 0),
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
