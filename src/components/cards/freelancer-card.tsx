import Link from 'next/link';
import { Star, Briefcase, MapPin } from 'lucide-react';
import { Card, Badge, Avatar, Button } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/constants';

const MAX_VISIBLE_SKILLS = 5;

/** Данные для карточки фрилансера (упрощённые) */
interface FreelancerCardData {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  skills: string[];
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  isOnline?: boolean;
  country?: string;
  city?: string;
}

interface FreelancerCardProps {
  freelancer: FreelancerCardData;
}

/**
 * Карточка исполнителя для каталога.
 * Показывает аватар, имя, рейтинг, навыки, ставку, статус.
 */
export const FreelancerCard = ({ freelancer }: FreelancerCardProps) => {
  const {
    id,
    name,
    avatarUrl,
    title,
    skills,
    hourlyRate,
    rating,
    reviewCount,
    completedProjects,
    isOnline,
    country,
    city,
  } = freelancer;

  const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
  const remainingSkillsCount = skills.length - MAX_VISIBLE_SKILLS;

  return (
    <Card hoverable>
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          src={avatarUrl}
          alt={name}
          size="lg"
          isOnline={isOnline}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={ROUTES.FREELANCER_DETAIL(id)}
              className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate"
            >
              {name}
            </Link>
            {isOnline && (
              <Badge variant="success" size="sm">Доступен</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{title}</p>
          {(country || city) && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <MapPin className="h-3 w-3" />
              {[city, country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-900">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            ({reviewCount})
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Briefcase className="h-3.5 w-3.5" />
          {completedProjects} проектов
        </div>
      </div>

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

      {/* Ставка и действия */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {hourlyRate ? (
          <p className="text-sm">
            <span className="font-semibold text-gray-900">
              {formatCurrency(hourlyRate)}
            </span>
            <span className="text-gray-500">/час</span>
          </p>
        ) : (
          <p className="text-sm text-gray-500">Ставка по запросу</p>
        )}
        <Link href={ROUTES.FREELANCER_DETAIL(id)}>
          <Button variant="outline" size="sm">
            Смотреть профиль
          </Button>
        </Link>
      </div>
    </Card>
  );
};
