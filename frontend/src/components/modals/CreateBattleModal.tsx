'use client'

import { useState } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { battleService } from '@/services/battleService'
import { CreateBattleRequest } from '@/types/api'
import { toast } from 'react-hot-toast'

const CreateBattleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  elements: z.array(z.object({
    name: z.string().min(1, 'Element name is required'),
    media_type: z.enum(['text', 'image', 'audio', 'video', 'document'])
  })).min(2, 'At least 2 elements required').max(10, 'Maximum 10 elements allowed')
})

type CreateBattleForm = z.infer<typeof CreateBattleSchema>

interface CreateBattleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateBattleModal({ isOpen, onClose }: CreateBattleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<CreateBattleForm>({
    resolver: zodResolver(CreateBattleSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      elements: [
        { name: '', media_type: 'text' },
        { name: '', media_type: 'text' }
      ]
    }
  })
  
  const onSubmit = async (data: CreateBattleForm) => {
    try {
      setIsSubmitting(true)
      await battleService.createBattle(data)
      toast.success('Battle created successfully!')
      form.reset()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create battle')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const addElement = () => {
    const currentElements = form.getValues('elements')
    if (currentElements.length < 10) {
      form.setValue('elements', [
        ...currentElements,
        { name: '', media_type: 'text' }
      ])
    }
  }
  
  const removeElement = (index: number) => {
    const currentElements = form.getValues('elements')
    if (currentElements.length > 2) {
      form.setValue('elements', currentElements.filter((_, i) => i !== index))
    }
  }
  
  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Create New Battle
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Form fields */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Battle Title (Optional)
                    </label>
                    <input
                      {...form.register('title')}
                      type="text"
                      id="title"
                      placeholder="Auto-generated if empty (e.g., 'Coca-Cola vs Pepsi, vote')"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                    {form.formState.errors.title && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  
                  {/* Elements */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Battle Elements ({form.watch('elements').length}/10)
                      </label>
                      {form.watch('elements').length < 10 && (
                        <button
                          type="button"
                          onClick={addElement}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Element
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {form.watch('elements').map((element, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <span className="text-sm font-medium text-gray-500 w-8">
                            {index + 1}.
                          </span>
                          <input
                            {...form.register(`elements.${index}.name`)}
                            type="text"
                            placeholder={`Element ${index + 1} name`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                          <select
                            {...form.register(`elements.${index}.media_type`)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                            <option value="audio">Audio</option>
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                          </select>
                          {form.watch('elements').length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeElement(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {form.formState.errors.elements && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.elements.message}</p>
                    )}
                  </div>
                  
                  {/* Submit button */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Battle'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}