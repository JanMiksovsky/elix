import { transmute } from "./template.js";

/**
 * Replace the slot with the given name.
 *
 * @param {DocumentFragment|Element} root
 * @param {string} slotName
 * @param {Node} content
 */
export function replaceSlot(root, slotName, content) {
  const selector = slotName ? `slot[name="${slotName}"]` : `slot:not([name])`;
  const slot = root.querySelector(selector);
  if (slot) {
    slot.replaceWith(content);
  }
}

/**
 * Set the default content of the slot with the given name.
 *
 * @param {DocumentFragment|Element} root
 * @param {string} slotName
 * @param {Node} content
 */
export function setSlotContent(root, slotName, content) {
  const selector = slotName ? `slot[name="${slotName}"]` : `slot:not([name])`;
  const slot = root.querySelector(selector);
  if (slot) {
    slot.innerHTML = "";
    slot.append(content);
  }
}

/**
 *
 * @param {DocumentFragment|Element} root
 * @param {string} partName
 * @param {PartDescriptor} descriptor
 * @returns {Element|null}
 */
export function transmutePart(root, partName, descriptor) {
  const part = root.querySelector(`[part~="${partName}"]`);
  return part ? transmute(part, descriptor) : null;
}
