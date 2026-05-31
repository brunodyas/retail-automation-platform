import Link from 'next/link';
import { Clock, MessageCircle, DollarSign } from 'lucide-react';
import { Card, Badge, Avatar } from '@/components/ui';
import { formatRelativeDate, formatCurrency, truncateText } from '@/utils/format';
import { ROUTES, PROJECT_STATUS_LABELS } from '@/constants';
import type { IProjectCard } from '@/types';

const MAX_DESCRIPTION_LENGTH = 150;
const MAX_VISIBLE_SKILLS = 4;

interface ProjectCardProps {
  project: IProjectCard;
}

/**
 * Карточка проекта для списка/каталога.
 * Отображает основную информацию: название, бюджет, навыки, статус.
 */
export const ProjectCard = ({ project }: ProjectCardProps) => {
  const {
    title,
    slug,
    category,
    description,
    skills,
    budgetType,
    budgetMin,
    budgetMax,
    status,
    proposalCount,
    clientName,
    clientAvatarUrl,
    createdAt,
  } = project;

  const budgetLabel =
    budgetType === 'fixed'
      ? budgetMax
        ? `${formatCurrency(budgetMin)} – ${formatCurrency(budgetMax)}`
        : formatCurrency(budgetMin)
      : `${formatCurrency(budgetMin)}/час`;

  const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
  const remainingSkillsCount = skills.length - MAX_VISIBLE_SKILLS;

  return (
    <Card hoverable>
      <Link href={ROUTES.PROJECT_DETAIL(slug)} className="block">
        {/* Заголовок и статус */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
            {title}
          </h3>
          <Badge
            variant={status === 'open' ? 'success' : 'default'}
            size="sm"
          >
            {PROJECT_STATUS_LABELS[status]}
          </Badge>
        </div>

        {/* Категория */}
        <p className="text-sm text-indigo-600 font-medium mb-2">{category}</p>

        {/* Описание */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {truncateText(description, MAX_DESCRIPTION_LENGTH)}
        </p>

        {/* Навыки */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {visibleSkills.map((skill) => (
            <Badge key={skill} variant="outline" size="sm">
              {skill}
            </Badge>
          ))}
          {remainingSkillsCount > 0 && (
            <Badge variant="default" size="sm">
              +{remainingSkillsCount}
            </Badge>
          )}
        </div>

        {/* Бюджет и метаданные */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
              <DollarSign className="h-4 w-4 text-green-600" />
              {budgetLabel}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MessageCircle className="h-3.5 w-3.5" />
              {proposalCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Avatar src={clientAvatarUrl} alt={clientName} size="sm" />
            <div className="text-right">
              <p className="text-xs text-gray-500">{clientName}</p>
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {formatRelativeDate(createdAt)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};
