/**
 * Sets the element's `childNodes` to the given set of nodes.
 *
 * This adds or removes the element's `childNodes` as necessary to match the
 * nodes indicated in the `childNodes` parameter.
 *
 * @param {Node} element - the element to update
 * @param {(NodeList|Node[])} childNodes - the set of nodes to apply
 */
export function applyChildNodes(element: Node, childNodes: NodeList | Node[]): void;
/**
 * Return the closest focusable node that's either the node itself (if it's
 * focusable), or the closest focusable ancestor in the *composed* tree.
 *
 * If no focusable node is found, this returns null.
 *
 * @param {Node} node
 * @returns {HTMLElement|null}
 */
export function closestFocusableNode(node: Node): HTMLElement | null;
/**
 * Return the ancestors of the given node in the composed tree.
 *
 * In the composed tree, the ancestor of a node assigned to a slot is that slot,
 * not the node's DOM ancestor. The ancestor of a shadow root is its host.
 *
 * @param {Node} node
 * @returns {Iterable<Node>}
 */
export function composedAncestors(node: Node): Iterable<Node>;
/**
 * Returns true if the first node contains the second, even if the second node
 * is in a shadow tree.
 *
 * The standard Node.contains() function does not account for Shadow DOM, and
 * returns false if the supplied target node is sitting inside a shadow tree
 * within the container.
 *
 * @param {Node} container - The container to search within.
 * @param {Node} target - The node that may be inside the container.
 * @returns {boolean} - True if the container contains the target node.
 */
export function deepContains(container: Node, target: Node): boolean;
/**
 * If the given element already has an ID, return it. If not, generate a
 * previously unused ID and return that.
 *
 * @param {Element} element
 * @returns {string}
 */
export function ensureId(element: Element): string;
/**
 * Return the first focusable element in the composed tree below the given root.
 * The composed tree includes nodes assigned to slots.
 *
 * This heuristic considers only the document order of the elements below the
 * root and whether a given element is focusable. It currently does not respect
 * the tab sort order defined by tabindex values greater than zero.
 *
 * @param {Node} root - the root of the tree in which to search
 * @returns {HTMLElement|null} - the first focusable element, or null if none
 * was found
 */
export function firstFocusableElement(root: Node): HTMLElement | null;
/**
 * Trap any `mousedown` events on the `origin` element and prevent the default
 * behavior from setting the focus on that element. Instead, put the focus on
 * the `target` element (or, if the `target` is not focusable, on the target's
 * closest focusable ancestor).
 *
 * If this method is called again with the same `origin` element, the old
 * forwarding is overridden, and focus will now go to the new `target` element.
 *
 * If the `target` parameter is `null`, focus handling will be removed from the
 * indicated `origin`.
 *
 * @param {HTMLElement} origin
 * @param {HTMLElement|null} target
 */
export function forwardFocus(origin: HTMLElement, target: HTMLElement | null): void;
/**
 * Search a list element for the item that contains the specified target.
 *
 * When dealing with UI events (e.g., mouse clicks) that may occur in
 * subelements inside a list item, you can use this routine to obtain the
 * containing list item.
 *
 * @param {NodeList|Node[]} items - A list element containing a set of items
 * @param {Node} target - A target element that may or may not be an item in the
 * list.
 * @returns {number} - The index of the list child that is or contains the
 * indicated target node. Returns -1 if not found.
 */
export function indexOfItemContainingTarget(items: NodeList | Node[], target: Node): number;
/**
 * Return true if the event came from within the node (or from the node itself);
 * false otherwise.
 *
 * @param {Node} node - The node to consider in relation to the event
 * @param {Event} event - The event which may have been raised within/by the
 * node
 * @returns {boolean} - True if the event was raised within or by the node
 */
export function ownEvent(node: Node, event: Event): boolean;
/**
 * Returns the set that includes the given node and all of its ancestors in the
 * composed tree. See [composedAncestors](#composedAncestors) for details on the
 * latter.
 *
 * @param {Node} node
 * @returns {Iterable<Node>}
 */
export function selfAndComposedAncestors(node: Node): Iterable<Node>;
