import React, { useState } from 'react';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiTrash2, FiEdit2, FiUser, FiAlertCircle, FiLoader } from 'react-icons/fi';
import bugService from '../services/bugService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import IssueTypeIcon from './IssueTypeIcon';

// Ticket Card Component
const TicketCard = ({ ticket, updatingTickets, navigate, handleDeleteTicket }) => {
  const isUpdating = updatingTickets.has(ticket.id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: { type: 'ticket', ticket }
  });

  const getPriorityBorderColor = (priority) => {
    const colors = {
      low: 'border-blue-400',
      medium: 'border-yellow-400',
      high: 'border-orange-400',
      critical: 'border-red-400',
    };
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-blue-600 bg-blue-50 border-blue-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      critical: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || 'U'}${lastName?.[0] || 'S'}`.toUpperCase();
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border-l-4 rounded-lg p-4 mb-3 cursor-move transition-all shadow-sm ${
        isDragging ? 'shadow-xl ring-2 ring-blue-500 scale-105' : 'hover:shadow-md border-gray-200'
      } ${isUpdating ? 'opacity-60' : ''}
      ${getPriorityBorderColor(ticket.priority)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 flex items-start gap-2">
          <IssueTypeIcon type={ticket.issue_type} size={16} className="mt-0.5" />
          <h3
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/ticket/${ticket.id}`);
            }}
            className="text-sm font-medium text-gray-900 flex-1 cursor-pointer hover:text-blue-600 hover:underline line-clamp-2"
          >
            {ticket.title}
          </h3>
        </div>
        {isUpdating && <FiLoader size={16} className="animate-spin text-blue-600" />}
      </div>

      <p className="text-[10px] font-mono text-gray-400 mb-2">{ticket.id.substring(0, 8)}...</p>

      {/* Info row */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority || 'medium'}
        </div>

        {ticket.assignee ? (
          <div className="flex items-center gap-1" title={`${ticket.assignee.first_name} ${ticket.assignee.last_name}`}>
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white shadow-sm">
              {getInitials(ticket.assignee.first_name, ticket.assignee.last_name)}
            </div>
          </div>
        ) : (
          <FiUser size={14} className="text-gray-300" />
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 mt-3 pt-2 border-t border-gray-50 opacity-0 hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/ticket/${ticket.id}`); }}
          className="text-gray-400 hover:text-blue-600 p-1"
        >
          <FiEdit2 size={14} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleDeleteTicket(ticket.id); }}
          className="text-gray-400 hover:text-red-600 p-1"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({ status, label, icon, color, textColor, tickets, updatingTickets, navigate, handleDeleteTicket }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-h-[500px] rounded-xl border ${
        isOver ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-400 ring-opacity-50' : `${color} border-gray-200`
      } transition-all duration-200 p-3`}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className={`font-bold ${textColor} flex items-center gap-2 text-sm uppercase tracking-wider`}>
          <span className="text-base">{icon}</span>
          {label}
          <span className="ml-1 px-2 py-0.5 bg-white bg-opacity-50 rounded-full text-[10px] font-bold">
            {tickets.length}
          </span>
        </h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {tickets.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-gray-300 ${isOver ? 'border-blue-400 bg-white bg-opacity-40' : 'opacity-40'}`}>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Empty</p>
          </div>
        ) : (
          <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                updatingTickets={updatingTickets}
                navigate={navigate}
                handleDeleteTicket={handleDeleteTicket}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ projectId, tickets, setTickets, loading }) => {
  const navigate = useNavigate();
  const [updatingTickets, setUpdatingTickets] = useState(new Set());

  const columns = {
    'open': { label: 'To Do', color: 'bg-gray-50', textColor: 'text-gray-600', icon: '○' },
    'in-progress': { label: 'In Progress', color: 'bg-indigo-50', textColor: 'text-indigo-700', icon: '⚡' },
    'in-review': { label: 'Review', color: 'bg-amber-50', textColor: 'text-amber-700', icon: '◉' },
    'resolved': { label: 'Resolved', color: 'bg-emerald-50', textColor: 'text-emerald-700', icon: '✓' },
    'closed': { label: 'Closed', color: 'bg-slate-50', textColor: 'text-slate-700', icon: '✕' },
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id;
    let newStatus = over.id;

    // Check if over is actually another ticket
    const overTicket = tickets.find(t => t.id === over.id);
    if (overTicket) {
      newStatus = overTicket.status;
    }

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    // Optimistic UI Update
    const oldTickets = [...tickets];
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    setUpdatingTickets(prev => new Set([...prev, ticketId]));

    try {
      await bugService.updateTicket(ticketId, { status: newStatus });
      toast.success(`Moved to ${columns[newStatus]?.label || newStatus}`);
    } catch (error) {
      setTickets(oldTickets);
      toast.error('Failed to move ticket');
      console.error('Update error:', error);
    } finally {
      setUpdatingTickets(prev => {
        const next = new Set(prev);
        next.delete(ticketId);
        return next;
      });
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Permanent delete this ticket?')) return;
    try {
      await bugService.deleteBug(ticketId);
      setTickets(tickets.filter(t => t.id !== ticketId));
      toast.success('Deleted');
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <FiAlertCircle size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Select a project to enable board</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader size={40} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {Object.entries(columns).map(([status, config]) => (
          <KanbanColumn
            key={status}
            status={status}
            {...config}
            tickets={tickets.filter(t => (t.status || 'open') === status)}
            updatingTickets={updatingTickets}
            navigate={navigate}
            handleDeleteTicket={handleDeleteTicket}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
