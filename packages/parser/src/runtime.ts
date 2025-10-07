/**
 * Runtime for ArchCSS
 * Mounts compiled model into DOM
 */

import type { CompiledModel } from "./types.js";

/**
 * Mount a compiled model into a target element
 */
export function mount(
  target: string | HTMLElement,
  model: CompiledModel
): void {
  const container =
    typeof target === "string" ? document.querySelector(target) : target;

  if (!container) {
    throw new Error(`Target not found: ${target}`);
  }

  // Create drawing wrapper
  const plan = document.createElement("div");
  plan.className = "draw";
  plan.setAttribute("role", "img");
  plan.setAttribute("aria-label", "Drawing");

  // Set grid mode if present
  if (model.grids && model.grids.length > 0 && model.grids[0]) {
    plan.setAttribute("data-grid", model.grids[0].mode);
  }

  // Mount rooms
  for (const room of model.rooms) {
    const roomEl = document.createElement("div");
    roomEl.className = "room";
    roomEl.id = room.id;
    roomEl.setAttribute("data-label", room.label || room.id);
    roomEl.setAttribute("role", "region");
    roomEl.setAttribute("aria-label", room.label || room.id);

    // Set CSS variables
    roomEl.style.setProperty("--x", room.x.toString());
    roomEl.style.setProperty("--y", room.y.toString());
    roomEl.style.setProperty("--w", room.w.toString());
    roomEl.style.setProperty("--h", room.h.toString());

    // Apply inline CSS properties
    if (room.css) {
      for (const [property, value] of Object.entries(room.css)) {
        roomEl.style.setProperty(property, value);
      }
    }

    plan.appendChild(roomEl);
  }

  // Mount walls
  for (const wall of model.walls) {
    const wallEl = document.createElement("div");
    wallEl.className = "wall";

    // Set CSS variables
    wallEl.style.setProperty("--x", wall.x1.toString());
    wallEl.style.setProperty("--y", wall.y1.toString());
    wallEl.style.setProperty("--len", wall.length!.toString());
    wallEl.style.setProperty("--angle", wall.angle!.toString());

    plan.appendChild(wallEl);
  }

  // Mount doors
  for (const door of model.doors) {
    const doorEl = document.createElement("div");
    doorEl.className = "door";
    doorEl.setAttribute("aria-label", "Door opening");

    // Set CSS variables
    doorEl.style.setProperty("--x", door.x1.toString());
    doorEl.style.setProperty("--y", door.y1.toString());
    doorEl.style.setProperty("--len", door.length!.toString());
    doorEl.style.setProperty("--angle", door.angle!.toString());
    doorEl.style.setProperty("--w", door.width.toString());

    plan.appendChild(doorEl);
  }

  // Clear and append
  container.innerHTML = "";
  container.appendChild(plan);
}

/**
 * Update an existing mounted plan with new model data
 * (useful for HMR)
 */
export function update(
  target: string | HTMLElement,
  model: CompiledModel
): void {
  // For now, just remount
  // TODO: Implement smart diffing for better performance
  mount(target, model);
}
