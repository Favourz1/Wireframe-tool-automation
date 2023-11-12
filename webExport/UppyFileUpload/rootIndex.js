export default () => {
        return `
            import { lazy } from 'react'
            export const index = lazy( ()=> import('./index'))
		 export const UppyFileUpload = lazy( ()=> import('./UppyFileUpload'))
		
        `
    }