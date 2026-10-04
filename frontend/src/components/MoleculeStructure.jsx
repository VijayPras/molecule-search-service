import { useEffect, useRef } from 'react';
import SmilesDrawer from 'smiles-drawer';

/**
 * Renders a 2D skeletal structure from a SMILES string directly in the
 * browser (no backend round-trip, no external image service — works fully
 * offline once the page is loaded).
 */
export default function MoleculeStructure({ smiles, size = 80 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const drawer = new SmilesDrawer.Drawer({
      width: size,
      height: size * 0.8,
      bondThickness: 1.2,
      compactDrawing: false,
    });

    SmilesDrawer.parse(
      smiles,
      (tree) => {
        if (canvasRef.current) {
          drawer.draw(tree, canvasRef.current, 'light', false);
        }
      },
      () => {
        // Invalid or undrawable SMILES — leave the canvas blank rather
        // than show a broken-image icon.
      }
    );
  }, [smiles, size]);

  return <canvas ref={canvasRef} width={size} height={size * 0.8} aria-label={`Structure of ${smiles}`} />;
}
