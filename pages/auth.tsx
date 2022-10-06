import Layout from '../components/layout'
import { AuthProvider } from '../context/authContext'
import IntroCard from '../components/introCard'
import { MenuProvider } from '../context/menu'
import { FormWizardProvider } from '../context/formWizardProvider'
import { AuthStep } from '../Models/Wizard'
import AuthWizard from '../components/Wizard/AuthWizard'
import { QueryProvider } from '../context/query'

export default function AuthPage() {

  return (
    <QueryProvider query>
      <Layout>
        <div className="flex content-center items-center justify-center mb-5 space-y-5 flex-col container mx-auto sm:px-6 lg:px-8 max-w-2xl">
          <div className="flex flex-col w-full text-white animate-fade-in">
            <AuthProvider>
              <MenuProvider>
                <FormWizardProvider initialStep={AuthStep.Email} initialLoading={false}>
                  <AuthWizard />
                </FormWizardProvider >
              </MenuProvider>
            </AuthProvider>
            <IntroCard />
          </div>
        </div>
      </Layout>
    </QueryProvider>
  )
}
