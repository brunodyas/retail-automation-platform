import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Edit, Star, Briefcase, MapPin, Clock, Globe,
  ExternalLink, CheckCircle, Shield,
} from 'lucide-react';
import { Button, Badge, Avatar, Card, CardTitle } from '@/components/ui';
import { ROUTES } from '@/constants';
import { getCurrentUser } from '@/api/auth';
import { getFreelancerProfile, getClientProfile } from '@/api/profile';
import { formatCurrency } from '@/utils/format';

/**
 * Страница личного профиля (Server Component).
 * Загружает данные текущего пользователя и показывает полный профиль.
 */
export default async function ProfilePage() {
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect(ROUTES.LOGIN);
  }

  const freelancer = await getFreelancerProfile(authUser.id);
  const client = await getClientProfile(authUser.id);

  // Используем freelancer-профиль если есть, иначе fallback
  const profile = freelancer || client;
  const name = profile?.name || authUser.user_metadata?.name || authUser.email || 'Пользователь';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Хедер профиля */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-6">
          <Avatar src={profile?.avatarUrl || null} alt={name} size="xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                  {profile?.isVerified && <CheckCircle className="h-5 w-5 text-blue-500" />}
                </div>
                {freelancer?.title && (
                  <p className="text-lg text-gray-600">{freelancer.title}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  {profile?.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {[profile.city, profile.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {profile?.timezone && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {profile.timezone}
                    </span>
                  )}
                </div>
              </div>
              <Link href={ROUTES.PROFILE_EDIT}>
                <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />}>
                  Редактировать
                </Button>
              </Link>
            </div>

            {/* Статистика исполнителя */}
            {freelancer && (
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{freelancer.stats.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({freelancer.stats.reviewCount} отзывов)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span>{freelancer.stats.completedProjects} проектов</span>
                </div>
                {freelancer.hourlyRate && (
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(freelancer.hourlyRate, 'USD', 'en-US')}/час
                  </span>
                )}
                <Badge variant={
                  freelancer.availability === 'available' ? 'success' :
                  freelancer.availability === 'partially_busy' ? 'warning' : 'default'
                }>
                  {freelancer.availability === 'available' ? 'Доступен' :
                   freelancer.availability === 'partially_busy' ? 'Частично занят' : 'Не берёт проекты'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 space-y-6">
        {/* О себе */}
        {freelancer?.bio && (
          <Card>
            <CardTitle>О себе</CardTitle>
            <p className="mt-3 text-gray-600 leading-relaxed whitespace-pre-wrap">{freelancer.bio}</p>
          </Card>
        )}

        {/* Навыки */}
        {freelancer && freelancer.skills.length > 0 && (
          <Card>
            <CardTitle>Навыки</CardTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {freelancer.skills.map((skill) => (
                <Badge key={skill} variant="outline" size="md">{skill}</Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Ссылки */}
        {freelancer?.links && Object.values(freelancer.links).some(Boolean) && (
          <Card>
            <CardTitle>Ссылки</CardTitle>
            <div className="mt-3 space-y-2">
              {Object.entries(freelancer.links)
                .filter(([, url]) => url)
                .map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {key.charAt(0).toUpperCase() + key.slice(1)}: {url}
                  </a>
                ))}
            </div>
          </Card>
        )}

        {/* Безопасность */}
        <Card>
          <CardTitle>Верификация</CardTitle>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Shield className={profile?.verificationStatus !== 'none' ? 'h-4 w-4 text-green-500' : 'h-4 w-4 text-gray-300'} />
              <span className="text-gray-700">Email подтверждён</span>
              {profile?.verificationStatus !== 'none' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-gray-400">
              Подтверждение повышает доверие заказчиков к вашему профилю.
            </p>
          </div>
        </Card>

        {/* Заполненность профиля */}
        {freelancer && !freelancer.title && (
          <Card className="border-yellow-200 bg-yellow-50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-800">Заполните профиль</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Добавьте заголовок, навыки и описание, чтобы получать больше заказов.
                </p>
                <Link href={ROUTES.PROFILE_EDIT} className="inline-block mt-3">
                  <Button variant="outline" size="sm">Заполнить профиль</Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
