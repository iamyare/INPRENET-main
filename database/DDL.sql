drop table "C##TEST"."afiliados_por_banco" cascade constraints ;
drop table "C##TEST"."banco" cascade constraints ;
drop table "C##TEST"."beneficio" cascade constraints ;
drop table "C##TEST"."beneficio_planilla" cascade constraints ;
drop table "C##TEST"."centro_trabajo" cascade constraints ;
drop table "C##TEST"."datos_identificacion" cascade constraints ;
drop table "C##TEST"."deduccion" cascade constraints ;
drop table "C##TEST"."detalle_deduccion" cascade constraints ;
drop table "C##TEST"."empleado" cascade constraints ;
drop table "C##TEST"."empleado_empresa" cascade constraints ;
drop table "C##TEST"."empresa" cascade constraints ;
drop table "C##TEST"."historial_salario" cascade constraints ;
drop table "C##TEST"."institucion" cascade constraints ;
drop table "C##TEST"."municipio" cascade constraints ;
drop table "C##TEST"."pais" cascade constraints ;
drop table "C##TEST"."afiliado" cascade constraints ;
drop table "C##TEST"."planilla" cascade constraints ;
drop table "C##TEST"."provincia" cascade constraints ;
drop table "C##TEST"."rol" cascade constraints ;
drop table "C##TEST"."tipo_planilla" cascade constraints ;
drop table "C##TEST"."usuario" cascade constraints ;
drop table "C##TEST"."perf_afil_cent_trab" cascade constraints ;
drop table "C##TEST"."referencia_personal" cascade constraints ;
drop table "C##TEST"."tipo_identificacion" cascade constraints ;
drop table "C##TEST"."usuario" cascade constraints ;
drop table "C##TEST"."referencia_personal_afiliado" cascade constraints ;
drop table "C##TEST"."detalle_afiliado" cascade constraints  ;
drop table "C##TEST"."detalle_beneficio" cascade constraints  ;
drop table "C##TEST"."detalle_beneficio_afiliado" cascade constraints  ;

drop TABLE "C##TEST"."net_afiliado" cascade constraints ;
drop TABLE "C##TEST"."net_afiliados_por_banco" cascade constraints ;
drop TABLE "C##TEST"."net_banco" cascade constraints ;
drop TABLE "C##TEST"."net_beneficio" cascade constraints ;
drop TABLE "C##TEST"."net_centro_trabajo" cascade constraints ;
drop TABLE "C##TEST"."net_deduccion" cascade constraints ;
drop TABLE "C##TEST"."net_detalle_afiliado" cascade constraints ;
drop TABLE "C##TEST"."net_detalle_beneficio_afiliado" cascade constraints ;
drop TABLE "C##TEST"."net_detalle_deduccion" cascade constraints ;
drop TABLE "C##TEST"."net_detalle_pago_beneficio" cascade constraints ;
drop TABLE "C##TEST"."net_empleado" cascade constraints ;
drop TABLE "C##TEST"."net_empleado_empresa" cascade constraints ;
drop TABLE "C##TEST"."net_empresa" cascade constraints ;
drop TABLE "C##TEST"."net_institucion" cascade constraints ;
drop TABLE "C##TEST"."net_municipio" cascade constraints ;
drop TABLE "C##TEST"."net_pais" cascade constraints ;
drop TABLE "C##TEST"."net_perf_afil_cent_trab" cascade constraints ;
drop TABLE "C##TEST"."net_planilla" cascade constraints ;
drop TABLE "C##TEST"."net_provincia" cascade constraints ;
drop TABLE "C##TEST"."net_referencia_personal" cascade constraints ;
drop TABLE "C##TEST"."net_referencia_personal_afiliado" cascade constraints ;
drop TABLE "C##TEST"."net_rol" cascade constraints ;
drop TABLE "C##TEST"."net_tipo_deduccion" cascade constraints ;
drop TABLE "C##TEST"."net_tipo_identificacion" cascade constraints ;
drop TABLE "C##TEST"."net_tipo_planilla" cascade constraints ;
drop TABLE "C##TEST"."net_usuario" cascade constraints ;

---------------------------------------------------------------------------------------------------------------------
drop PROCEDURE calcular_suma_montos_aplicado(
    p_afiliado_id IN NUMBER,
    mes_in IN NUMBER, 
    anio_in IN NUMBER,
    mes OUT NUMBER, 
    anio OUT NUMBER,
    p_suma_montos_aplicado OUT NUMBER
) IS
  PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
  SELECT SUM("monto_aplicado"), "mes", "anio"
  INTO p_suma_montos_aplicado, mes, anio
  FROM "C##TEST"."detalle_deduccion"
  WHERE "id_afiliado" = p_afiliado_id AND "mes"=mes_in AND "anio"=anio_in
  GROUP BY "id_afiliado", "mes", "anio" 
 ;
 EXCEPTION
    WHEN NO_DATA_FOUND THEN
    mes:= mes_in;
    anio:= anio;
    p_suma_montos_aplicado:=0;
    
END calcular_suma_montos_aplicado;

---------------------------------------------------------------------------------------------------------------------
drop TRIGGER "trig_modificar_monto_total"
BEFORE INSERT ON "detalle_deduccion"
FOR EACH ROW
DECLARE 
  v_monto_total "C##TEST"."detalle_deduccion"."monto_total"%TYPE;
  v_afiliado "C##TEST"."detalle_deduccion"."id_afiliado"%TYPE;
  v_salario_base "C##TEST"."afiliado"."salario_base"%TYPE;
  v_suma_montos_aplicado NUMBER := 0; -- Variable para almacenar la suma de montos_aplicado
  mes NUMBER; 
  anio NUMBER;
  montoMinimo NUMBER := 100;
BEGIN
  -- Obtiene el monto total
  v_monto_total := :NEW."monto_total";

  -- Busca el afiliado
  BEGIN
    SELECT "C##TEST"."afiliado"."id_afiliado", "C##TEST"."afiliado"."salario_base"
    INTO v_afiliado, v_salario_base
    FROM "C##TEST"."afiliado"
    WHERE "C##TEST"."afiliado"."id_afiliado" = :NEW."id_afiliado";
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      -- Manejo de error: el afiliado no se encontró
      DBMS_OUTPUT.PUT_LINE('Afiliado no encontrado para ID: ' || :NEW."id_afiliado");
      RETURN;
  END;

  -- Obtener la suma de montos_aplicado
  calcular_suma_montos_aplicado(v_afiliado, :NEW."mes", :NEW."anio", mes, anio, v_suma_montos_aplicado);

  -- Ajustar Deduccionaplicada igual a Deducciontotal para idafiliados que no cumplen con las condiciones anteriores
  IF (mes = :NEW."mes" AND  anio = :NEW."anio") THEN
     IF (v_suma_montos_aplicado + v_monto_total <= GREATEST(montoMinimo, v_salario_base - montoMinimo))   THEN
        :NEW."monto_aplicado" := v_monto_total;
        --:NEW."estado_aplicacion" := 'COBRADO TOTALMENTE';
      ELSE
        IF (ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo)) = 0)   THEN
          --:NEW."estado_aplicacion" := 'NO COBRADO';
          :NEW."monto_aplicado" := 0;
        ELSIF (ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo)) > 0)  THEN
          --:NEW."estado_aplicacion" := 'COBRADO PARCIALMENTE';
          :NEW."monto_aplicado" := ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo));
        END IF;
      END IF;
  ELSE  
    v_suma_montos_aplicado := 0;
    IF (v_suma_montos_aplicado + v_monto_total <= GREATEST(montoMinimo, v_salario_base - montoMinimo))   THEN
    DBMS_OUTPUT.PUT_LINE('Suma de montos_aplicado: ' || v_suma_montos_aplicado);
        :NEW."monto_aplicado" := v_monto_total;
        --:NEW."estado_aplicacion" := 'COBRADO TOTALMENTE';
      ELSE
      DBMS_OUTPUT.PUT_LINE('Suma de montos_aplicado: ' || v_suma_montos_aplicado);
        IF (ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo)) = 0)   THEN
          --:NEW."estado_aplicacion" := 'NO COBRADO';
          :NEW."monto_aplicado" := 0;
        ELSIF (ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo)) > 0)  THEN
          --:NEW."estado_aplicacion" := 'COBRADO PARCIALMENTE';
          :NEW."monto_aplicado" := ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo));
        END IF;
      END IF;
  END IF;
 
END;


---------------------------------------------------------------------------------------------------------------------
drop TRIGGER trg_incrementar_rentas_aplicadas
BEFORE UPDATE ON "C##TEST"."detalle_beneficio"
FOR EACH ROW
DECLARE
  v_old_num_rentas NUMBER;
BEGIN
  -- Almacenar el valor original de num_rentas_aplicadas
  v_old_num_rentas := :OLD."num_rentas_aplicadas";

  -- Verificar si el valor de 'estado' ha cambiado a 'PAGADA'
  IF UPDATING('estado') AND :NEW."estado" = 'PAGADA' THEN
    -- Incrementar num_rentas_aplicadas en 1
    :NEW."num_rentas_aplicadas" := v_old_num_rentas + 1;
  END IF;
END;