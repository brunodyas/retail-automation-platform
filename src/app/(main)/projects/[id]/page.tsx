import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Calendar, DollarSign, Eye, Users, Shield,
  Clock, Tag, MapPin,
} from 'lucide-react';
import { Badge, Card, CardTitle, Avatar } from '@/components/ui';
import { getProjectById } from '@/api/projects';
import { getProfileById } from '@/api/profile';
import { formatDate, formatRelativeDate, formatCurrency } from '@/utils/format';
import { PROJECT_STATUS_LABELS, EXPERIENCE_LEVELS, APP_NAME } from '@/constants';
import { ProposalForm } from './proposal-form';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: ProjectDetailPageProps
): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return { title: 'Проект не найден' };

  return {
    title: project.title,
    description: project.description.slice(0, 160),
    openGraph: {
      title: `${project.title} | ${APP_NAME}`,
      description: project.description.slice(0, 160),
    },
  };
}

/**
 * Страница детали проекта (Server Component).
 */
export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const client = await getProfileById(project.clientId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основное содержимое */}
        <div className="lg:col-span-2 space-y-6">
          {/* Заголовок */}
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <Badge variant={project.status === 'open' ? 'success' : 'default'}>
                {PROJECT_STATUS_LABELS[project.status] || project.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatRelativeDate(project.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {project.viewCount} просмотров
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {project.proposalCount} заявок
              </span>
              {project.hasNda && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Shield className="h-4 w-4" />
                  NDA
                </span>
              )}
            </div>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {project.description}
              </p>
            </div>
          </Card>

          {/* Навыки */}
          {project.skills.length > 0 && (
            <Card>
              <CardTitle>Необходимые навыки</CardTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <Badge key={skill} variant="outline" size="md">{skill}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Этапы */}
          {project.milestones.length > 0 && (
            <Card>
              <CardTitle>Этапы работы</CardTitle>
              <div className="mt-3 space-y-3">
                {project.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-600 text-sm font-semibold rounded-full shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{milestone.title}</p>
                      {milestone.description && (
                        <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(milestone.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Форма заявки */}
          {project.status === 'open' && (
            <ProposalForm projectId={project.id} />
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Бюджет */}
          <Card>
            <CardTitle>Бюджет</CardTitle>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(project.budgetMin)}
                  {project.budgetMax && ` — ${formatCurrency(project.budgetMax)}`}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {project.budgetType === 'fixed' ? 'Фиксированная цена' : 'Почасовая оплата'}
              </div>
            </div>
          </Card>

          {/* Детали */}
          <Card>
            <CardTitle>Детали</CardTitle>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{project.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {EXPERIENCE_LEVELS[project.experienceLevel as keyof typeof EXPERIENCE_LEVELS] || 'Любой уровень'}
                </span>
              </div>
              {project.deadline && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Дедлайн: {formatDate(project.deadline)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Заказчик */}
          <Card>
            <CardTitle>Заказчик</CardTitle>
            <div className="mt-3">
              {client ? (
                <div className="flex items-center gap-3">
                  <Avatar src={client.avatarUrl} alt={client.name} size="md" />
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-xs text-gray-500">
                      На платформе с {formatDate(client.createdAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Информация недоступна</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
