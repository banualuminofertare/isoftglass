/**
 * Extract material codes with quantities from a product configuration.
 * Walks the config tree and collects {code, quantity} pairs for all accessories.
 */
export interface MaterialConsumption {
  code: string;
  quantity: number;
}

export function extractMaterialConsumption(config: Record<string, unknown>): MaterialConsumption[] {
  const result: MaterialConsumption[] = [];

  const addCode = (code: string | unknown, qty: number) => {
    if (typeof code === 'string' && code) {
      const existing = result.find(r => r.code === code);
      if (existing) existing.quantity += qty;
      else result.push({ code, quantity: qty });
    }
  };

  /** Helper: extract from selections[] array or fallback to single materialCode */
  const addFromSelectionsOrCode = (
    obj: Record<string, unknown> | undefined,
    selectionsKey: string,
    codeKey: string,
    qty: number
  ) => {
    if (!obj) return;
    const sels = obj[selectionsKey] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(sels) && sels.length > 0) {
      sels.forEach(sel => addCode(sel.materialCode, qty));
    } else {
      addCode(obj[codeKey], qty);
    }
  };

  const acc = config.accessories as Record<string, unknown> | undefined;
  if (acc) {
    // Hinges
    const hinges = acc.hinges as Record<string, unknown> | undefined;
    if (hinges) {
      const qty = Number(hinges.quantity) || 1;
      const selections = hinges.selections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(selections) && selections.length > 0) {
        selections.forEach(sel => addCode(sel.materialCode, qty));
      } else {
        addCode(hinges.materialCode, qty);
      }
    }

    // Handle (with selections fallback)
    const handle = acc.handle as Record<string, unknown> | undefined;
    if (handle) addFromSelectionsOrCode(handle, 'selections', 'materialCode', 1);

    // Profiles (with selections fallback)
    const profiles = acc.profiles as Record<string, unknown> | undefined;
    if (profiles) addFromSelectionsOrCode(profiles, 'selections', 'materialCode', 1);

    // Stabilizers
    const stabilizers = acc.stabilizers as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(stabilizers)) {
      stabilizers.forEach(st => addCode(st.materialCode, 1));
    }
    // Stabilizer selections (catalog pattern)
    const stabSels = acc.stabilizerSelections as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(stabSels)) {
      stabSels.forEach(sel => addCode(sel.materialCode, 1));
    }

    // Seals (with selections fallback for each seal type)
    const seals = acc.seals as Record<string, unknown> | undefined;
    if (seals) {
      addFromSelectionsOrCode(seals, 'magneticSelections', 'magneticMaterialCode', 1);
      addFromSelectionsOrCode(seals, 'rubberSelections', 'rubberMaterialCode', 1);
      addFromSelectionsOrCode(seals, 'thresholdSelections', 'thresholdMaterialCode', 1);
    }

    // Lock
    const lock = acc.lock as Record<string, unknown> | undefined;
    if (lock && lock.enabled) addCode(lock.materialCode, 1);

    // Pivot
    const pivot = acc.pivot as Record<string, unknown> | undefined;
    if (pivot) addCode(pivot.materialCode, 1);

    // Sliding system
    const sliding = acc.slidingSystem as Record<string, unknown> | undefined;
    if (sliding) addCode(sliding.materialCode, 1);

    // Mount points (balustrade)
    const mountPoints = acc.mountPoints as Record<string, unknown> | undefined;
    if (mountPoints) {
      const mpQty = Number(mountPoints.quantity) || 1;
      const mpCodes = mountPoints.materialCodes as string[] | undefined;
      if (Array.isArray(mpCodes)) mpCodes.forEach(c => addCode(c, mpQty));
      else addCode(mountPoints.materialCode, mpQty);
    }

    // Handrail (balustrade)
    const handrail = acc.handrail as Record<string, unknown> | undefined;
    if (handrail) addCode(handrail.materialCode, 1);

    // U Profile (balustrade)
    const uProfile = acc.uProfile as Record<string, unknown> | undefined;
    if (uProfile) addCode(uProfile.materialCode, 1);

    // Extra accessories
    const extras = acc.extraAccessories as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(extras)) {
      extras.forEach(e => {
        const qty = Number(e.quantity) || 1;
        addCode(e.materialCode, qty);
      });
    }

    // Fixed panel accessories (left/right may have their own accessories)
    const fixedPanel = acc.fixedPanel as Record<string, unknown> | undefined;
    if (fixedPanel) {
      ['left', 'right'].forEach(side => {
        const panel = (fixedPanel as Record<string, unknown>)[side] as Record<string, unknown> | undefined;
        if (panel?.accessories) {
          const panelExtras = (panel.accessories as Record<string, unknown>)?.extraAccessories as Array<Record<string, unknown>> | undefined;
          if (Array.isArray(panelExtras)) {
            panelExtras.forEach(e => addCode(e.materialCode, Number(e.quantity) || 1));
          }
        }
      });
    }
  }

  // Top-level extraAccessories
  const topExtras = config.extraAccessories as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(topExtras)) {
    topExtras.forEach(e => addCode(e.materialCode, Number(e.quantity) || 1));
  }

  // Selected Kit items
  const kit = config.selectedKit as Record<string, unknown> | undefined;
  if (kit) {
    addCode(kit.code, 1);
    const kitItems = kit.items as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(kitItems)) {
      kitItems.forEach(item => addCode(item.material_code, Number(item.quantity) || 1));
    }
  }

  // Lateral config
  const lateral = config.lateralConfig as Record<string, unknown> | undefined;
  if (lateral) {
    // Lateral hinges
    const latHinges = lateral.hinges as Record<string, unknown> | undefined;
    if (latHinges) {
      const qty = Number(latHinges.quantity) || 1;
      const selections = latHinges.selections as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(selections) && selections.length > 0) {
        selections.forEach(sel => addCode(sel.materialCode, qty));
      } else {
        addCode(latHinges.materialCode, qty);
      }
    }
    // Lateral handle (with selections fallback)
    const latHandle = lateral.handle as Record<string, unknown> | undefined;
    if (latHandle) addFromSelectionsOrCode(latHandle, 'selections', 'materialCode', 1);
    // Lateral profiles (with selections fallback)
    const latProfiles = lateral.profiles as Record<string, unknown> | undefined;
    if (latProfiles) addFromSelectionsOrCode(latProfiles, 'selections', 'materialCode', 1);
    // Lateral seals (with selections fallback)
    const latSeals = lateral.seals as Record<string, unknown> | undefined;
    if (latSeals) {
      addFromSelectionsOrCode(latSeals, 'magneticSelections', 'magneticMaterialCode', 1);
      addFromSelectionsOrCode(latSeals, 'rubberSelections', 'rubberMaterialCode', 1);
      addFromSelectionsOrCode(latSeals, 'thresholdSelections', 'thresholdMaterialCode', 1);
    }
  }

  // Partition wall doors + perimeter profiles
  const pw = config.partitionWall as Record<string, unknown> | undefined;
  if (pw) {
    const doors = pw.doors as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(doors)) {
      doors.forEach(door => {
        const doorAcc = door.accessories as Record<string, unknown> | undefined;
        if (!doorAcc) return;
        const dHinges = doorAcc.hinges as Record<string, unknown> | undefined;
        if (dHinges) addCode(dHinges.materialCode || dHinges.finish, Number(dHinges.quantity) || 1);
        const dHandle = doorAcc.handle as Record<string, unknown> | undefined;
        if (dHandle) addCode(dHandle.materialCode || dHandle.finish, 1);
        const dExtras = doorAcc.extraAccessories as Array<Record<string, unknown>> | undefined;
        if (Array.isArray(dExtras)) {
          dExtras.forEach(e => addCode(e.materialCode, Number(e.quantity) || 1));
        }
      });
    }
    // Perimeter profile selections
    const pwProfileSels = pw.profileSelections as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(pwProfileSels)) {
      pwProfileSels.forEach(sel => addCode(sel.materialCode, 1));
    } else {
      addCode(pw.profileMaterialCode, 1);
    }
  }

  return result.filter(r => r.quantity > 0);
}
