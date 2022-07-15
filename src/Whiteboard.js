/**
 * PlatziBoard: Pizarra digital con RxJS
 * Esta es la implementación de PlatziBoard utilizando React.
 * Gracias a que usamos el hook useEffect de React, no requerimos utilizar el
 * operador merge de RxJS como en el proyecto original.
 */
import React, { useRef, useEffect } from "react";
import { fromEvent } from "rxjs";
import { map, mergeAll, takeUntil } from "rxjs/operators";

const Whiteboard = () => {
  /** @type {React.Ref<HTMLCanvasElement>} */
  const canvasRef = useRef(null);

  const startWhiteboard = () => {
    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext("2d");

    const cursorPosition = { x: 0, y: 0 };
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    const updateCursorPosition = (event) => {
      cursorPosition.x = event.clientX - canvas.offsetLeft;
      cursorPosition.y = event.clientY - canvas.offsetTop;
    };

    /**
     * Declaramos los observables generados con RxJS
     * para atrapar los eventos de mousedown, mouseup y mousemove.
     */
    const onMouseDown$ = fromEvent(canvas, "mousedown");
    onMouseDown$.subscribe(updateCursorPosition);
    const onMouseUp$ = fromEvent(canvas, "mouseup");
    const onMouseMove$ = fromEvent(canvas, "mousemove").pipe(
      takeUntil(onMouseUp$)
    );

    canvasContext.lineWidth = 8;
    canvasContext.lineJoin = "round";
    canvasContext.lineCap = "round";
    canvasContext.strokeStyle = "white";

    /**
     * El método paintStroke nos permitirá dibujar una línea obteniendo
     * las posiciones del cursor (cursorPosition).
     */
    const paintStroke = (event) => {
      canvasContext.beginPath();
      canvasContext.moveTo(cursorPosition.x, cursorPosition.y);
      updateCursorPosition(event);
      canvasContext.lineTo(cursorPosition.x, cursorPosition.y);
      canvasContext.stroke();
      canvasContext.closePath();
    };

    const paintWhiteboard$ = onMouseDown$.pipe(
      map(() => onMouseMove$),
      mergeAll()
    );

    paintWhiteboard$.subscribe(paintStroke);
  };

  /**
   * El hook useEffect permite iniciar la pizarra digital
   * una vez se recarga la página.
   */
  useEffect(() => {
    startWhiteboard();
  }, []);

  return (
    <>
      <h1 className="web-title">PlatziBoard</h1>
      <canvas
        ref={canvasRef}
        id="reactive-canvas"
        className="reactive-canvas"
        height={500}
        width={900}
      />
      <br />
      <button className="restart-button" onClick={startWhiteboard}>
        Reiniciar
      </button>
    </>
  );
};

export default Whiteboard;
