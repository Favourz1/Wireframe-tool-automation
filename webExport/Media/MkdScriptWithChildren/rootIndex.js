export default () => {
        return `
            import { lazy } from 'react'
            export const MkdScript = lazy( ()=> import('./MkdScript'))
		 export const UppyFileUpload = lazy( ()=> import('./UppyFileUpload'))
		
        `
    }