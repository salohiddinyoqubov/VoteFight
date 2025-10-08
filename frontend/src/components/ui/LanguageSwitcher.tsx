'use client'

import { useState } from 'react'
import { GlobeAltIcon, CheckIcon } from '@heroicons/react/24/outline'
import { Listbox, Transition } from '@headlessui/react'
import { mockLanguages } from '@/mocks/data'

export function LanguageSwitcher() {
  const [selectedLanguage, setSelectedLanguage] = useState(mockLanguages[0])

  return (
    <Listbox value={selectedLanguage} onChange={setSelectedLanguage}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-red-300 sm:text-sm">
          <span className="block truncate">
            <span className="mr-2">{selectedLanguage.flag}</span>
            {selectedLanguage.name}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          </span>
        </Listbox.Button>
        <Transition
          as="div"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
            {mockLanguages.map((language) => (
              <Listbox.Option
                key={language.code}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-red-100 text-red-900' : 'text-gray-900'
                  }`
                }
                value={language}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      <span className="mr-2">{language.flag}</span>
                      {language.name}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-600">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}