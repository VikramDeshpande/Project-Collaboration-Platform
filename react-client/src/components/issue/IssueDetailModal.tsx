import { Icon } from '@iconify/react';
import moment from 'moment';
import { lazy, Suspense as S, useState } from 'react';
import { UpdateIssueType } from '../../api/apiTypes';
import {
  selectIssuesArray,
  useDeleteIssueMutation,
  useUpdateIssueMutation,
} from '../../api/endpoints/issues.endpoint';
import { useAppSelector } from '../../store/hooks';
import DropDown, { Category } from '../util/DropDown';
import WithLabel from '../util/WithLabel';
import type { IssueMetaData, IssueModalProps } from './IssueModelHOC';
import Item from '../util/Item';
import TextareaInput from './TextareaInput';
import Model from '../util/Model';
import CommentSection from './CommentSection';
import { parseDate } from '../../utils';
import { selectAuthUser } from '../../api/endpoints/auth.endpoint';
import toast from 'react-hot-toast';
import "./style.css";

const ConfirmModel = lazy(() => import('../util/ConfirmModel'));

const IssueDetailModal = (props: IssueModalProps) => {
  const { issue: Issue, projectId, members, lists, types, priorities, onClose } = props;
  const issue = Issue as IssueMetaData;
  const { userId } = useAppSelector((s) => s.query.issue);
  const { issues } = selectIssuesArray({ listId: issue.listId, projectId, userId });
  const { authUser: u } = selectAuthUser();
  const {
    id,
    type,
    listId,
    reporterId,
    priority,
    assignees,
    summary,
    deadline,
    descr,
    createdAt,
    updatedAt,
  } = issues[issue.idx];
  const memberObj = members.reduce((t, n) => ({ ...t, [n.value]: n }), {}) as Category[];
  const [updateIssue] = useUpdateIssueMutation();
  const [deleteIssue] = useDeleteIssueMutation();
  const [isOpen, setIsOpen] = useState(false);
  const isMine = reporterId === u?.id;
  const reporter = members.filter(({ value }) => value === reporterId)[0];

  const calculateDaysRemaining = (createdAt: string | undefined, deadlineInDays: number) => {
    if (deadlineInDays === 0) {
      return 'No deadline set';
    }
    const createdAtMoment = moment(createdAt);
    const currentMoment = moment();
    const remainingDuration = moment.duration(createdAtMoment.add(deadlineInDays, 'days').diff(currentMoment));
    const daysRemaining = Math.floor(remainingDuration.asDays());
    const hoursRemaining = Math.floor(remainingDuration.asHours()) % 24;
    const formattedResult = `${daysRemaining} d ${hoursRemaining} h`;
    return formattedResult;
  };
  
  const calculateTimeBarWidth = (createdAt: string | undefined, deadlineInDays: number) => {
    const createdAtMoment = moment(createdAt);
    const currentMoment = moment();
    const remainingDuration = moment.duration(createdAtMoment.add(deadlineInDays, 'days').diff(currentMoment));
    const hoursRemaining = Math.floor(remainingDuration.asHours());
    const deadlineHours = deadlineInDays * 24;
    const widthPercentage = Math.max(0, Math.min((hoursRemaining / deadlineHours) * 100, 100));
    return widthPercentage;
  };

  const dispatchMiddleware = async (data: DispatchMiddleware) => {
    const assigneeIds = assignees.map(({ userId }) => userId);
    const body =
      data.type === 'assignee' ? constructApiAssignee(assigneeIds, data.value as number[]) : data;
    if (!body) return;
    await updateIssue({ id, body: { ...body, projectId: Number(projectId) } });
    toast(`Updated the issue ${cipher[data.type as keyof typeof cipher] ?? data.type}!`);
  };

  return (
    <Model onClose={onClose} className='max-w-[65rem]'>
      <>
        <div className='mt-3 flex items-center justify-between text-[16px] text-gray-600 sm:px-3'>
          <Item size='h-4 w-4' {...types[type]} text={'Issue-' + id} />
          <div className='text-black'>
            {isMine && (
              <button onClick={() => setIsOpen(true)} title='Delete' className='btn-icon text-xl'>
                <Icon icon='bx:trash' />
              </button>
            )}
            <button onClick={onClose} title='Close' className='btn-icon ml-4 text-lg'>
              <Icon icon='akar-icons:cross' />
            </button>
          </div>
        </div>
        <div className='sm:flex md:gap-3'>
          <div className='w-full sm:pr-6'>
            <TextareaInput
              type='summary'
              label='Title'
              defaultValue={summary}
              apiFunc={dispatchMiddleware}
              className='font-medium sm:text-[22px] sm:font-semibold'
              placeholder='title'
              max={100}
              isRequired
              readOnly={!isMine}
            />
            <TextareaInput
              label='Description'
              type='descr'
              defaultValue={descr}
              placeholder='add a description'
              max={500}
              apiFunc={dispatchMiddleware}
              readOnly={!isMine}
            />
            {/* progress bar here */}
            <div className='mt-4 items-center mx-3'>
              <div className='flex items-center time_due'>
                <div className='time_icon'>
                  <span className='mt-1 mb-2 text-[14px] font-medium text-c-1'>Time Due</span>
                  <Icon icon='bi:stopwatch' className='mt-1.5 mx-1' />
                </div>
                <span className='items-right'>{calculateDaysRemaining(createdAt, deadline)}</span>
              </div>
              <div className='h-1 bg-gray-200 rounded-md overflow-hidden timeprogress_div'>
                <div
                  className={`h-full transition-all ease-in-out duration-300 ${calculateTimeBarWidth(createdAt, deadline) < 25 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  style={{ width: `${calculateTimeBarWidth(createdAt, deadline)}%` }}  
                />
              </div>
            </div>
            {/* <hr className='mx-3' /> */}
            <CommentSection issueId={id} projectId={projectId} />
          </div>
          <div className='mt-3 shrink-0 sm:w-[15rem]'>
            <WithLabel label='Status'>
              <DropDown
                list={lists}
                defaultValue={lists.findIndex(({ value: v }) => v === listId)}
                dispatch={dispatchMiddleware}
                actionType='listId'
                type='normal'
                variant='small'
                isEditable={true}
              />
            </WithLabel>
            {members && (
              <WithLabel label='Reporter'>
                <div className='rounded-sm bg-[#f4f5f7] px-4 py-[5px] sm:w-fit'>
                  <Item
                    {...reporter}
                    text={reporter.text + (isMine ? ' (you)' : '')}
                    size='h-6 w-6'
                    variant='ROUND'
                  />
                </div>
              </WithLabel>
            )}
            {members && (
              <WithLabel label='Assignee'>
                <DropDown
                  variant='small'
                  list={members}
                  defaultValue={assignees.map(({ userId }) => memberObj[userId])}
                  dispatch={dispatchMiddleware}
                  actionType='assignee'
                  type='multiple'
                  isEditable={isMine}
                />
              </WithLabel>
            )}
            <WithLabel label='Deadline (in days)'>
              <input
                type='number'
                value={deadline}
                onChange={(e) => isMine && dispatchMiddleware({ type: 'deadline', value: parseInt(e.target.value, 10) })}
                className={`w-full border rounded-md p-2 ${isMine ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                min={0}
                max={30}
                readOnly={!isMine}
              />
            </WithLabel>
            <WithLabel label='Type'>
              <DropDown
                variant='small'
                list={types}
                defaultValue={types.findIndex(({ value: v }) => v === type)}
                dispatch={dispatchMiddleware}
                actionType='type'
                type='normal'
                isEditable={isMine}
              />
            </WithLabel>
            <WithLabel label='Priority'>
              <DropDown
                variant='small'
                list={priorities}
                defaultValue={priority as number}
                dispatch={dispatchMiddleware}
                actionType='priority'
                type='normal'
                isEditable={isMine}
              />
            </WithLabel>
            <hr className='border-t-[.5px] border-gray-400' />
            <div className='mt-4 text-sm text-gray-700'>
              {createdAt && <span className='mb-2 block'>Created {parseDate(createdAt)}</span>}
              {updatedAt && <span>Updated {parseDate(updatedAt)}</span>}
            </div>
          </div>
        </div>
        {isOpen && (
          <S>
            <ConfirmModel
              onClose={() => setIsOpen(false)}
              onSubmit={() => deleteIssue({ issueId: id, projectId })}
              toastMsg='Deleted the issue!'
            />
          </S>
        )}
      </>
    </Model>
  );
};

export default IssueDetailModal;

const constructApiAssignee = (OLD: number[], NEW: number[]): DispatchMiddleware | undefined => {
  const oldLen = OLD.length,
    newLen = NEW.length;
  if (oldLen === newLen) return;
  const userId = newLen > oldLen ? NEW[newLen - 1] : OLD.filter((id) => !NEW.includes(id))[0];
  return {
    type: newLen > oldLen ? 'addAssignee' : 'removeAssignee',
    value: userId,
  };
};

export type DispatchMiddleware = {
  type: UpdateIssueType;
  value: number | number[] | string;
};
const cipher = {
  descr: 'description',
  listId: 'status',
};
