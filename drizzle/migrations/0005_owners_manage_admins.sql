CREATE OR REPLACE FUNCTION public.is_blink_owner(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = _user_id AND email_confirmed_at IS NOT NULL AND lower(email) IN ('otaviotoledo610@gmail.com','renanneublum@gmail.com')) $$;

CREATE OR REPLACE FUNCTION public.assign_blink_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF lower(NEW.email) IN ('otaviotoledo610@gmail.com', 'renanneublum@gmail.com') AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_user_admin(_target uuid, _grant boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_blink_owner(auth.uid()) THEN RAISE EXCEPTION 'Somente os responsáveis podem alterar administradores.'; END IF;
  IF _grant THEN
    INSERT INTO public.user_roles(user_id, role) SELECT _target, 'admin' WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_target AND role='admin');
  ELSE
    IF public.is_blink_owner(_target) THEN RAISE EXCEPTION 'Não é possível remover um responsável.'; END IF;
    DELETE FROM public.user_roles WHERE user_id = _target AND role = 'admin';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.list_admin_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT user_id FROM public.user_roles WHERE role='admin' AND public.has_role(auth.uid(),'admin') $$;

REVOKE EXECUTE ON FUNCTION public.set_user_admin(uuid,boolean), public.list_admin_ids(), public.is_blink_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_admin(uuid,boolean), public.list_admin_ids(), public.is_blink_owner(uuid) TO authenticated;