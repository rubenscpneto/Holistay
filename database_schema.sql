-- HOLISTAY DB BLUEPRINT V1.0
-- Este script cria todas as tabelas, tipos, funções e políticas de segurança (RLS).

-- ========== ETAPA 1: CRIAÇÃO DOS TIPOS (ENUMs) ==========

-- Remove tipos antigos se existirem, para permitir re-execução (em desenvolvimento)
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.task_status;
DROP TYPE IF EXISTS public.task_type;
DROP TYPE IF EXISTS public.property_status;
DROP TYPE IF EXISTS public.booking_status;
DROP TYPE IF EXISTS public.expense_category;

-- Cria os tipos ENUM para consistência de dados
CREATE TYPE public.user_role AS ENUM ('manager', 'owner');
CREATE TYPE public.task_status AS ENUM ('todo', 'inprogress', 'done');
CREATE TYPE public.task_type AS ENUM ('cleaning', 'maintenance');
CREATE TYPE public.property_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'cancelled');
CREATE TYPE public.expense_category AS ENUM ('maintenance', 'utilities', 'supplies', 'other');


-- ========== ETAPA 2: CRIAÇÃO DAS TABELAS ==========

-- Tabela de Perfis de Usuários (Managers e Owners)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'manager',
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Armazena perfis de usuários com login (managers, owners).';

-- Tabela de Membros da Equipe (Acesso via "Link Mágico")
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_info text,
  access_token uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.team_members IS 'Membros da equipe operacional (limpeza, etc.) sem login.';

-- Tabela Principal de Imóveis
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip_code text,
  address_country text,
  image_url text,
  commission_rate numeric(5, 2) DEFAULT 0.00,
  ical_url text,
  default_check_in_time time DEFAULT '15:00:00',
  default_check_out_time time DEFAULT '11:00:00',
  status public.property_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.properties IS 'Imóveis gerenciados pela plataforma.';

-- Tabela de Custos Fixos (associados aos imóveis)
CREATE TABLE public.fixed_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.fixed_costs IS 'Custos fixos mensais (condomínio, internet) dos imóveis.';

-- Tabela de Reservas (populada via iCal e editada manualmente)
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  ical_uid text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  guest_name text,
  total_revenue numeric(10, 2) DEFAULT 0.00,
  platform_fee numeric(10, 2) DEFAULT 0.00,
  status public.booking_status DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_ical_uid UNIQUE(ical_uid, property_id)
);
COMMENT ON TABLE public.bookings IS 'Reservas importadas do iCal e enriquecidas manualmente.';

-- Tabela de Despesas Variáveis
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  expense_date date NOT NULL,
  category public.expense_category DEFAULT 'other',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.expenses IS 'Despesas variáveis (lâmpadas, café, reparos).';

-- Tabela de Tarefas (Kanban)
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  assignee_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  title text NOT NULL,
  due_date timestamptz NOT NULL,
  status public.task_status DEFAULT 'todo',
  type public.task_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.tasks IS 'Tarefas operacionais (limpeza, manutenção).';

-- Tabela de Itens do Checklist (associados às tarefas)
CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  description text NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.checklist_items IS 'Sub-tarefas de uma tarefa principal.';

-- Tabela de Comentários das Tarefas
CREATE TABLE public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.task_comments IS 'Comentários e histórico de uma tarefa.';


-- ========== ETAPA 3: FUNÇÕES E TRIGGERS ==========

-- Função para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o Trigger de `updated_at` nas tabelas relevantes
CREATE TRIGGER on_properties_update
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_bookings_update
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_expenses_update
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_tasks_update
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Função para criar um `profile` quando um novo usuário se cadastra no `auth.users`
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', 'manager'); -- Define 'manager' como role padrão
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o Trigger de novo usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ========== ETAPA 4: POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY) ==========

-- Habilita RLS em todas as tabelas (Princípio da Negação por Padrão)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- 1. Tabela `profiles`
CREATE POLICY "Usuários podem ver o próprio perfil." ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar o próprio perfil." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Tabela `team_members`
CREATE POLICY "Managers podem gerenciar sua própria equipe." ON public.team_members
  FOR ALL USING (auth.uid() = manager_id);

-- 3. Tabela `properties`
CREATE POLICY "Managers e Owners podem ver seus imóveis." ON public.properties
  FOR SELECT USING (auth.uid() = manager_id OR auth.uid() = owner_id);
CREATE POLICY "Managers podem criar e gerenciar seus imóveis." ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = manager_id);
CREATE POLICY "Managers podem atualizar seus imóveis." ON public.properties
  FOR UPDATE USING (auth.uid() = manager_id);
CREATE POLICY "Managers podem deletar seus imóveis." ON public.properties
  FOR DELETE USING (auth.uid() = manager_id);

-- 4. Tabelas `fixed_costs`, `bookings`, `expenses`, `tasks`
--    Estas tabelas usam a mesma lógica: Acesso total para o Manager, Acesso de Leitura para o Owner.

-- Criar uma função auxiliar para checar se o usuário é Manager de um imóvel
CREATE OR REPLACE FUNCTION public.is_manager_of_property(property_id_to_check uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.properties
    WHERE id = property_id_to_check AND manager_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Criar uma função auxiliar para checar se o usuário tem acesso (Manager ou Owner) a um imóvel
CREATE OR REPLACE FUNCTION public.can_view_property(property_id_to_check uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.properties
    WHERE id = property_id_to_check AND (manager_id = auth.uid() OR owner_id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Aplicar políticas usando as funções (para `fixed_costs`, `bookings`, `expenses`, `tasks`)
-- A lógica é a mesma para todas elas:
CREATE POLICY "Managers/Owners podem ver dados de seus imóveis." ON public.fixed_costs
  FOR SELECT USING (public.can_view_property(property_id));
CREATE POLICY "Managers podem modificar dados de seus imóveis." ON public.fixed_costs
  FOR ALL USING (public.is_manager_of_property(property_id));

CREATE POLICY "Managers/Owners podem ver dados de seus imóveis." ON public.bookings
  FOR SELECT USING (public.can_view_property(property_id));
CREATE POLICY "Managers podem modificar dados de seus imóveis." ON public.bookings
  FOR ALL USING (public.is_manager_of_property(property_id));

CREATE POLICY "Managers/Owners podem ver dados de seus imóveis." ON public.expenses
  FOR SELECT USING (public.can_view_property(property_id));
CREATE POLICY "Managers podem modificar dados de seus imóveis." ON public.expenses
  FOR ALL USING (public.is_manager_of_property(property_id));

CREATE POLICY "Managers/Owners podem ver dados de seus imóveis." ON public.tasks
  FOR SELECT USING (public.can_view_property(property_id));
CREATE POLICY "Managers podem modificar dados de seus imóveis." ON public.tasks
  FOR ALL USING (public.is_manager_of_property(property_id));


-- 5. Tabelas `checklist_items` e `task_comments`
--    Estas tabelas dependem do acesso à `task` principal.

-- Função auxiliar para checar acesso à tarefa (indiretamente pelo imóvel)
CREATE OR REPLACE FUNCTION public.can_view_task(task_id_to_check uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tasks t
    JOIN public.properties p ON t.property_id = p.id
    WHERE t.id = task_id_to_check AND (p.manager_id = auth.uid() OR p.owner_id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Função auxiliar para checar se é manager da tarefa (indiretamente pelo imóvel)
CREATE OR REPLACE FUNCTION public.is_manager_of_task(task_id_to_check uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tasks t
    JOIN public.properties p ON t.property_id = p.id
    WHERE t.id = task_id_to_check AND p.manager_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Aplicar políticas
CREATE POLICY "Managers/Owners podem ver itens de tarefas." ON public.checklist_items
  FOR SELECT USING (public.can_view_task(task_id));
CREATE POLICY "Managers podem modificar itens de tarefas." ON public.checklist_items
  FOR ALL USING (public.is_manager_of_task(task_id));

CREATE POLICY "Managers/Owners podem ver comentários de tarefas." ON public.task_comments
  FOR SELECT USING (public.can_view_task(task_id));
CREATE POLICY "Managers podem modificar comentários de tarefas." ON public.task_comments
  FOR ALL USING (public.is_manager_of_task(task_id));