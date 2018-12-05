import * as symbols from '../../src/symbols.js';
import ReactiveMixin from '../../src/ReactiveMixin.js';
import SelectedIndexMixin from '../../src/SelectedIndexMixin.js';


class SelectedIndexTest extends ReactiveMixin(SelectedIndexMixin(HTMLElement)) {}
customElements.define('selected-index-test', SelectedIndexTest);


describe("SelectedIndexMixin", () => {

  let container;

  before(() => {
    container = document.getElementById('container');
  });

  afterEach(() => {
    container.innerHTML = '';
  });

  it("has selectedIndex initially 0", () => {
    const fixture = new SelectedIndexTest();
    assert.equal(fixture.state.selectedIndex, 0);
  });

  it("can advance the selection to the next item", async () => {
    const fixture = new SelectedIndexTest();
    assert.equal(fixture.state.selectedIndex, 0);
    const selectionChanged0 = fixture.selectNext();
    assert.equal(fixture.state.selectedIndex, 1);
    assert(selectionChanged0);
    const selectionChanged1 = fixture.selectNext();
    assert.equal(fixture.state.selectedIndex, 2);
    assert(selectionChanged1);
  });

  it("can move the selection to the previous item", async () => {
    const fixture = new SelectedIndexTest();
    assert.equal(fixture.state.selectedIndex, 0);
    const selectionChanged0 = fixture.selectPrevious();
    assert.equal(fixture.state.selectedIndex, -1);
    assert(selectionChanged0);
    const selectionChanged1 = fixture.selectPrevious();
    assert.equal(fixture.state.selectedIndex, -2);
    assert(selectionChanged1);
  });

  // it("can wrap the selection from the last to the first item", async () => {
  //   const fixture = new SelectedIndexTest();
  //   fixture.selectionWraps = true;
  //   fixture.setState({ selectedIndex: 2 });
  //   fixture.selectNext();
  //   assert.equal(fixture.state.selectedIndex, 0);
  //   await Promise.resolve();
  // });

  // it("can wrap the selection from the first to the last item", async () => {
  //   const fixture = new SelectedIndexTest();
  //   fixture.selectionWraps = true;
  //   fixture.setState({ selectedIndex: 0 });
  //   fixture.selectPrevious();
  //   assert.equal(fixture.state.selectedIndex, 2);
  //   await Promise.resolve();
  // });

  // it("selects first item when selection is required and no item is currently selected", async () => {
  //   const fixture = new SelectedIndexTest();
  //   assert.equal(fixture.state.selectedIndex, -1);
  //   await fixture.setState({
  //     selectionRequired: true
  //   });
  //   assert.equal(fixture.state.selectedIndex, 0);
  // });

  // it("preserves selected item when items change and old selection exists in new set", async () => {
  //   const fixture = new SelectedIndexTest();
  //   fixture.setState({
  //     selectedIndex: 1
  //   });
  //   assert.equal(fixture.state.selectedIndex, 1);
  //   fixture.setState({
  //     items: fixture.state.items.slice(1) // Removes item 0
  //   });
  //   assert.equal(fixture.state.selectedIndex, 0);
  // });

  // it("selects nearest item when item in last place is removed", async () => {
  //   const fixture = new SelectedIndexTest();
  //   const items = fixture.items.slice();
  //   items.splice(2, 1);
  //   await fixture.setState({
  //     items,
  //     selectedIndex: 2
  //   });
  //   assert.equal(fixture.state.selectedIndex, 1);
  // });

  // it("drops selection when the last item is removed", async () => {
  //   const fixture = new SelectedIndexTest();
  //   await fixture.setState({
  //     items: [],
  //     selectedIndex: 0
  //   });
  //   assert.equal(fixture.selectedIndex, -1);
  // });

  // it("sets canSelectNext/canSelectPrevious with no wrapping", async () => {
  //   const fixture = new SelectedIndexTest();
  //   assert(!fixture.selectionWraps);

  //   // No selection yet
  //   assert.equal(fixture.state.selectedIndex, -1);
  //   assert(fixture.canSelectNext);
  //   assert(fixture.canSelectPrevious);

  //   // Start of list
  //   fixture.selectFirst();
  //   assert(fixture.canSelectNext);
  //   assert(!fixture.canSelectPrevious);

  //   // Middle of list
  //   fixture.selectNext();
  //   assert(fixture.canSelectNext);
  //   assert(fixture.canSelectPrevious);

  //   // End of list
  //   fixture.selectLast();
  //   assert(!fixture.canSelectNext);
  //   assert(fixture.canSelectPrevious);

  //   await Promise.resolve();
  // });

  // it("sets canSelectNext/canSelectPrevious with wrapping", async () => {
  //   const fixture = new SelectedIndexTest();
  //   fixture.selectionWraps = true;

  //   // Start of list
  //   fixture.selectFirst();
  //   assert(fixture.canSelectNext);
  //   assert(fixture.canSelectPrevious);

  //   // End of list
  //   fixture.selectLast();
  //   assert(fixture.canSelectNext);
  //   assert(fixture.canSelectPrevious);

  //   await Promise.resolve();
  // });

  // it("changing selection through (simulated) user interaction raises the selected-index-changed event", done => {
  //   const fixture = new SelectedIndexTest();
  //   fixture.addEventListener('selected-index-changed', () => {
  //     done();
  //   });
  //   container.appendChild(fixture);

  //   fixture[symbols.raiseChangeEvents] = true; // Simulate user interaction
  //   fixture.selectedIndex = 1;
  //   fixture[symbols.raiseChangeEvents] = false;
  // });

  // it("changing selection programmatically does not raise the selected-index-changed event", done => {
  //   const fixture = new SelectedIndexTest();
  //   fixture.addEventListener('selected-index-changed', () => {
  //     assert.fail(null, null, 'selected-index-changed event should not have been raised in response to programmatic property change');
  //   });
  //   container.appendChild(fixture);
  //   fixture.selectedIndex = 1; // This should not trigger events.
  //   // Give event handler a chance to run (but it shouldn't).
  //   setTimeout(done);
  // });

  // it("adds selected calculation to itemCalcs", async () => {
  //   const fixture = new SelectedIndexTest();
  //   const items = fixture.items;

  //   // Start of list
  //   fixture.selectFirst();
  //   assert(fixture.itemCalcs(items[0], 0).selected);
  //   assert(!fixture.itemCalcs(items[1], 1).selected);
  //   assert(!fixture.itemCalcs(items[2], 2).selected);

  //   // End of list
  //   fixture.selectLast();
  //   assert(!fixture.itemCalcs(items[0], 0).selected);
  //   assert(!fixture.itemCalcs(items[1], 1).selected);
  //   assert(fixture.itemCalcs(items[2], 2).selected);
    
  //   await Promise.resolve();
  // });

});
