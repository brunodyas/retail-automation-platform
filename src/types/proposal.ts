/** Статус отклика */
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

/** Отклик исполнителя на проект */
export interface IProposal {
  id: string;
  projectId: string;
  freelancerId: string;
  coverLetter: string;
  proposedPrice: number;
  estimatedDays: number;
  status: ProposalStatus;
  attachments: IProposalAttachment[];
  createdAt: string;
  updatedAt: string;
}

/** Вложение к отклику */
export interface IProposalAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

/** Отклик с данными исполнителя (для отображения заказчику) */
export interface IProposalWithFreelancer extends IProposal {
  freelancerName: string;
  freelancerAvatarUrl?: string;
  freelancerTitle: string;
  freelancerRating: number;
  freelancerCompletedProjects: number;
}
