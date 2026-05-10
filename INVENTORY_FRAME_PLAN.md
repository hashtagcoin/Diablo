# Inventory Panel Frame Plan

## Goal

Build the inventory from decorative parts rather than one stretched background. The panel uses a fixed content rectangle with decorative edges layered around it, so equipment and bag slots always line up.

## Panel Blueprint

- Outer panel target: `430px` wide, `min(680px, calc(100vh - 120px))` tall.
- Frame thickness: `34px`.
- Content inset: `34px` on all sides.
- Header: `36px` high.
- Equipment bay: `170px` high.
- Item detail strip: `70px` high.
- Bag viewport: exactly `4 columns x 3 rows`.
- Bag slot size: `70px`.
- Bag gap: `8px`.
- Bag viewport width: `4 * 70 + 3 * 8 = 304px`.
- Bag viewport height: `3 * 70 + 2 * 8 = 226px`.
- Inventory pages scroll horizontally only. Each page is one `4x3` grid.
- Wallet/footer: `36px` high.

## Decorative Asset Parts

Generate these as transparent PNGs so they can tile/stretch independently:

- `inventory-frame-top.png`: horizontal gothic top edge, no text, joinable ends.
- `inventory-frame-right.png`: vertical gothic right edge, no text, joinable ends.
- `inventory-frame-bottom.png`: horizontal gothic bottom edge, no text, joinable ends.
- `inventory-frame-left.png`: vertical gothic left edge, no text, joinable ends.
- `inventory-corner-tl.png`: top-left corner cap.
- `inventory-corner-tr.png`: top-right corner cap.
- `inventory-corner-br.png`: bottom-right corner cap.
- `inventory-corner-bl.png`: bottom-left corner cap.
- Optional `inventory-interior.png`: dark leather/stone interior texture.
- Optional `inventory-slot.png`: empty item slot frame.
- Optional `equipment-slot.png`: larger equipped item slot frame.

## Generation Prompt Shape

Create original dark gothic fantasy inventory frame parts for an action RPG UI. Blackened iron, aged gold filigree, red gemstone accents, carved cathedral motifs, no text, no logos. Each part must sit on a flat chroma-key background for transparency. Edges must have straight inner boundaries and decorative outer boundaries. Corners must visually join with the edge pieces.

## Implementation Notes

- Frame parts are layered absolutely with `pointer-events: none`.
- Slots live inside `.inventory-content`, not on the frame layer.
- The bag region uses `overflow-x: auto` and `overflow-y: hidden`.
- JavaScript chunks inventory items into pages of 12 and renders each page as a 4x3 grid.
